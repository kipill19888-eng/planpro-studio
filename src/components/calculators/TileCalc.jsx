import { useState, useEffect, useRef } from 'react';
import { Play, PlusCircle, Grid, LayoutGrid, FileDown, LayoutTemplate, Loader2, Ruler, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useHouseStore, useRooms } from '../../store';
import { useEstimateStore } from '../../storeEstimate';
import { useToastStore } from '../../storeToast';
import { useMaterialsStore } from '../../storeMaterials';
import { useWorksStore } from '../../storeWorks';
import { useDraftsStore } from '../../storeDrafts';
import { useAddToEstimate } from '../../hooks/useAddToEstimate';
import RoomSelector from './RoomSelector';

import fontUrl from '../../assets/fonts/Roboto-Regular.ttf';

let globalPdfFont = null;

export default function TileCalc() {
  const rooms = useRooms();
  const { getCalculatedAreas } = useHouseStore();
  const { addItem } = useEstimateStore();
  const { addToast } = useToastStore();
  const { getMaterialPrice } = useMaterialsStore();
  const { getWorkPrice } = useWorksStore();
  const { drafts, saveDraft, clearDraft } = useDraftsStore();
  const { isAdded, triggerAdd } = useAddToEstimate();
  const areas = getCalculatedAreas();

  const draftKey = 'calc-tile';
  const draft = drafts[draftKey] || {};

  const [calcMode, setCalcMode] = useState(draft.calcMode || 'surface');

  const [selectedId, setSelectedId] = useState(draft.selectedId || 'all');
  const [surface, setSurface] = useState(draft.surface || 'floor');
  const [area, setArea] = useState(draft.area || areas.floorArea.toFixed(1));

  const [stairStepsCount, setStairStepsCount] = useState(draft.stairStepsCount || '18');
  const [stairStepHeight, setStairStepHeight] = useState(draft.stairStepHeight || '150');
  const [stairStepWidth, setStairStepWidth] = useState(draft.stairStepWidth || '300');
  const [stairWidth, setStairWidth] = useState(draft.stairWidth || '1000');
  const [stairCladdingType, setStairCladdingType] = useState(draft.stairCladdingType || 'full');
  const [stairOverhang, setStairOverhang] = useState(draft.stairOverhang || '20');

  const [tileWidth, setTileWidth] = useState(draft.tileWidth || '59.5');
  const [tileHeight, setTileHeight] = useState(draft.tileHeight || '59.5');
  const [layout, setLayout] = useState(draft.layout || 'straight');
  const [groutWidth, setGroutWidth] = useState(draft.groutWidth || '2');
  const [offsetXcm, setOffsetXcm] = useState(draft.offsetXcm || '0');
  const [offsetYcm, setOffsetYcm] = useState(draft.offsetYcm || '0');
  
  const [result, setResult] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [showStairMap, setShowStairMap] = useState(false);
  
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [mapSurface, setMapSurface] = useState('floor');
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const mapRef = useRef(null);
  const stairMapRef = useRef(null);
  const activeRoomForMap = rooms.find(r => r.id === selectedRoomId);

  useEffect(() => {
    saveDraft(draftKey, { 
      calcMode, selectedId, surface, area, 
      stairStepsCount, stairStepHeight, stairStepWidth, stairWidth, stairCladdingType, stairOverhang,
      tileWidth, tileHeight, layout, groutWidth, offsetXcm, offsetYcm 
    });
  }, [calcMode, selectedId, surface, area, stairStepsCount, stairStepHeight, stairStepWidth, stairWidth, stairCladdingType, stairOverhang, tileWidth, tileHeight, layout, groutWidth, offsetXcm, offsetYcm, saveDraft]);

  useEffect(() => {
    if (calcMode === 'surface' && selectedId === 'all' && !draft.area) {
      setArea(surface === 'floor' ? areas.floorArea.toFixed(1) : areas.wallsArea.toFixed(1));
    }
    setResult(null);
  }, [selectedId, surface, rooms, areas.floorArea, areas.wallsArea, calcMode]);

  const handleRoomSelect = (id, newArea) => {
    setSelectedId(id);
    if (newArea && typeof newArea === 'string') {
      setArea(newArea);
    }
  };

  useEffect(() => {
    const loadFont = async () => {
      if (globalPdfFont) return;
      try {
        const response = await fetch(fontUrl);
        const buffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        globalPdfFont = window.btoa(binary);
      } catch (e) {
        console.error("Ошибка загрузки шрифта", e);
      }
    };
    loadFont();
  }, []);

  const handleCalc = () => {
    setResult(null);
    setShowStairMap(false);

    if (calcMode === 'surface') {
      const a = parseFloat(area) || 0;
      const w = parseFloat(tileWidth) || 30;
      const h = parseFloat(tileHeight) || 30;
      const grout = parseFloat(groutWidth) || 2;

      let wasteFactor = layout === 'straight' ? 1.05 : 1.15;
      if (w <= 20 || h <= 20) wasteFactor += 0.05;

      const totalArea = a * wasteFactor;
      const tileArea = (w * h) / 10000;
      const totalTiles = Math.ceil(totalArea / tileArea);
      const glueKg = totalArea * 4;
      const glueBags = Math.ceil(glueKg / 25);
      const groutKg = ((w + h) / (w * h)) * grout * 10 * 1.6 * totalArea;

      setResult({
        type: 'surface',
        totalArea,
        totalTiles,
        glueBags,
        groutKg: groutKg.toFixed(1),
        cleanArea: a,
        w, h
      });
    } else {
      const steps = parseInt(stairStepsCount) || 0;
      const sh = parseFloat(stairStepHeight) || 0;
      const sw = parseFloat(stairStepWidth) || 0;
      const L = parseFloat(stairWidth) || 0;
      const tw = parseFloat(tileWidth) / 100;
      const th = parseFloat(tileHeight) / 100;
      const gw = parseFloat(groutWidth) / 1000;
      const ov = parseFloat(stairOverhang) / 1000;

      if (steps <= 0 || sh <= 0 || sw <= 0 || L <= 0) {
        addToast('Количество ступеней и их размеры должны быть больше 0', 'error');
        return;
      }

      const treads = steps > 0 ? steps - 1 : 0;
      const w_m = sw / 1000;
      const h_m = sh / 1000;
      const L_m = L / 1000;

      let treadArea = 0;
      let riserArea = 0;

      if (stairCladdingType === 'full' || stairCladdingType === 'tread') {
        const effectiveTreadDepth = w_m + ov;
        treadArea = effectiveTreadDepth * L_m;
      }
      if (stairCladdingType === 'full' || stairCladdingType === 'riser') {
        riserArea = h_m * L_m;
      }

      const totalTreadArea = treadArea * treads;
      const totalRiserArea = riserArea * (steps - 1);
      const totalArea = totalTreadArea + totalRiserArea;

      const tileArea = tw * th;
      const totalTiles = Math.ceil((totalArea * 1.1) / tileArea);

      const glueKg = totalArea * 4;
      const glueBags = Math.ceil(glueKg / 25);
      const groutKg = ((tw + th) / (tw * th)) * gw * 10 * 1.6 * totalArea;

      setResult({
        type: 'stair',
        steps,
        treads,
        totalArea,
        treadArea: totalTreadArea,
        riserArea: totalRiserArea,
        totalTiles,
        glueBags,
        groutKg: groutKg.toFixed(1),
        cleanArea: totalArea,
      });
    }
  };

  const addToEstimate = () => {
    if (!result) {
      addToast('Сначала нажмите «Рассчитать»', 'error');
      return;
    }

    triggerAdd(() => {
      const materialPrice = getMaterialPrice('плитка', 'tile', 'material');
      const gluePrice = getMaterialPrice('клей для плитки', 'tile', 'glue');
      const groutPrice = getMaterialPrice('затирка', 'tile', 'grout');
      const workPrice = getWorkPrice('w-tile') || getMaterialPrice('укладка плитки', 'tile', 'work');

      if (result.type === 'surface') {
        const surfaceName = surface === 'floor' ? 'Пол' : 'Стены';
        let roomSuffix = '';
        if (selectedId !== 'all') {
          const activeGroup = rooms.find(r => (r.groupId || `single-${r.id}`) === selectedId);
          if (activeGroup) roomSuffix = ` (${activeGroup.name})`;
        }

        addItem({ name: `Плитка ${result.w}x${result.h} см [${surfaceName}]${roomSuffix}`, unit: 'м²', quantity: Math.ceil(result.totalArea), materialPrice: materialPrice, workPrice: 0 });
        addItem({ name: `Клей для плитки [${surfaceName}]${roomSuffix}`, unit: 'меш. (25 кг)', quantity: result.glueBags, materialPrice: gluePrice, workPrice: 0 });
        addItem({ name: `Затирка для швов (${groutWidth} мм) [${surfaceName}]${roomSuffix}`, unit: 'кг', quantity: Math.ceil(parseFloat(result.groutKg)), materialPrice: groutPrice, workPrice: 0 });
        addItem({ name: `Работа: Укладка плитки [${surfaceName}]${roomSuffix}`, unit: 'м²', quantity: result.cleanArea, materialPrice: 0, workPrice: workPrice });
        
      } else {
        const claddingName = stairCladdingType === 'full' ? 'ступени + подступенки' : stairCladdingType === 'tread' ? 'только ступени' : 'только подступенки';
        
        addItem({ name: `Плитка для лестницы ${tileWidth}x${tileHeight} см (${claddingName})`, unit: 'м²', quantity: Math.ceil(result.totalArea), materialPrice: materialPrice, workPrice: 0 });
        addItem({ name: `Клей для плитки (лестница)`, unit: 'меш. (25 кг)', quantity: result.glueBags, materialPrice: gluePrice, workPrice: 0 });
        addItem({ name: `Затирка для швов (лестница)`, unit: 'кг', quantity: Math.ceil(parseFloat(result.groutKg)), materialPrice: groutPrice, workPrice: 0 });
        addItem({ name: `Работа: Облицовка лестницы плиткой`, unit: 'м²', quantity: Math.ceil(result.totalArea), materialPrice: 0, workPrice: workPrice * 1.2 });
      }

      clearDraft(draftKey);
    });
  };

  const getIntersection = (r1, r2) => {
    const xOverlap = Math.max(0, Math.min(r1.x + r1.w, r2.x + r2.w) - Math.max(r1.x, r2.x));
    const yOverlap = Math.max(0, Math.min(r1.y + r1.h, r2.y + r2.h) - Math.max(r1.y, r2.y));
    return xOverlap > 0.1 && yOverlap > 0.1;
  };

  const renderMapSVG = () => {
    if (!activeRoomForMap) return null;

    let width = 0, height = 0;
    let openings = [];
    let surfaceName = '';

    if (mapSurface === 'floor') {
      width = activeRoomForMap.length;
      height = activeRoomForMap.width;
      surfaceName = 'Пол';
    } else {
      if (mapSurface === 'top' || mapSurface === 'bottom') width = activeRoomForMap.length;
      else width = activeRoomForMap.width;

      height = activeRoomForMap.height;
      openings = activeRoomForMap.openings ? activeRoomForMap.openings.filter(o => o.wall === mapSurface) : [];

      const wallNames = { top: 'Задняя стена', bottom: 'Передняя стена', left: 'Левая стена', right: 'Правая стена' };
      surfaceName = wallNames[mapSurface];
    }

    const tileW = parseFloat(tileWidth) / 100;
    const tileH = parseFloat(tileHeight) / 100;
    const grout = parseFloat(groutWidth) / 1000;

    const offsetXm = (parseFloat(offsetXcm) || 0) / 100;
    const offsetYm = (parseFloat(offsetYcm) || 0) / 100;

    const scale = 100;
    const svgWidth = width * scale;
    const svgHeight = height * scale;

    const stepW = tileW + grout;
    const stepH = tileH + grout;

    const cols = Math.ceil((width - offsetXm) / stepW);
    const rows = Math.ceil((height - offsetYm) / stepH);

    const tiles = [];

    const svgOpenings = openings.map(op => ({
      x: op.offset * scale,
      y: svgHeight - (op.sill + op.height) * scale,
      w: op.width * scale,
      h: op.height * scale
    }));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLastCol = c === cols - 1;
        const isLastRow = r === rows - 1;

        const x = (c * stepW + offsetXm) * scale;

        let drawY = 0;
        let currentH = 0;

        if (mapSurface === 'floor') {
          drawY = (r * stepH + offsetYm) * scale;
          currentH = isLastRow ? (height - (r * stepH + offsetYm)) * scale : tileH * scale;
        } else {
          const currentY = (r * stepH + offsetYm) * scale;
          currentH = isLastRow ? (height - (r * stepH + offsetYm)) * scale : tileH * scale;
          drawY = svgHeight - currentY - currentH;
        }

        let finalW = isLastCol ? (width - (c * stepW + offsetXm)) * scale : tileW * scale;

        let drawW = Math.max(finalW - grout * scale, 1);
        let drawH = Math.max(currentH - grout * scale, 1);
        let drawX = x + (grout * scale) / 2;
        let finalDrawY = drawY + (grout * scale) / 2;

        const currentTileRect = { x: drawX, y: finalDrawY, w: drawW, h: drawH };

        let intersectedOpening = null;
        for (let op of svgOpenings) {
          if (getIntersection(currentTileRect, op)) {
            intersectedOpening = op;
            break;
          }
        }

        let isCompletelyInside = false;
        if (intersectedOpening) {
          const op = intersectedOpening;
          if (currentTileRect.x >= op.x && currentTileRect.x + currentTileRect.w <= op.x + op.w &&
              currentTileRect.y >= op.y && currentTileRect.y + currentTileRect.h <= op.y + op.h) {
            isCompletelyInside = true;
          }
        }

        if (isCompletelyInside) continue;

        const isCutW = isLastCol && (finalW < tileW * scale - 0.1);
        const isCutH = isLastRow && (currentH < tileH * scale - 0.1);
        const isCutByOpening = intersectedOpening !== null;

        const isCut = isCutW || isCutH || isCutByOpening;

        let actualW = finalW;
        let actualH = currentH;

        if (intersectedOpening) {
          const op = intersectedOpening;
          if (drawX < op.x && drawX + drawW > op.x) actualW = op.x - drawX;
          if (drawX < op.x + op.w && drawX + drawW > op.x + op.w) actualW = (drawX + drawW) - (op.x + op.w);
          if (finalDrawY < op.y && finalDrawY + drawH > op.y) actualH = op.y - finalDrawY;
          if (finalDrawY < op.y + op.h && finalDrawY + drawH > op.y + op.h) actualH = (finalDrawY + drawH) - (op.y + op.h);
        } else {
          if (isCutW) actualW = finalW;
          if (isCutH) actualH = currentH;
        }

        const wMm = Math.round((actualW / scale) * 1000);
        const hMm = Math.round((actualH / scale) * 1000);

        const isWidthCut = wMm < Math.round(tileW * 1000) - 1;
        const isHeightCut = hMm < Math.round(tileH * 1000) - 1;

        let currentFontSize = 9;
        if (drawW < 50 || drawH < 50) currentFontSize = 7;
        if (drawW < 35 || drawH < 35) currentFontSize = 6;
        if (drawW < 25 || drawH < 25) currentFontSize = 5;
        if (drawW < 15 || drawH < 15) currentFontSize = 4;

        tiles.push(
          <g key={`${r}-${c}`}>
            <rect
              x={drawX}
              y={finalDrawY}
              width={drawW}
              height={drawH}
              fill={isCut ? '#ef4444' : '#bfdbfe'}
              stroke="#475569"
              strokeWidth="1"
            />

            {isCut && isWidthCut && (
              <text
                x={drawX + drawW / 2}
                y={finalDrawY + 3}
                fill="white"
                fontSize={currentFontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="hanging"
                style={{ paintOrder: 'stroke', stroke: '#ef4444', strokeWidth: 2 }}
              >
                {wMm}
              </text>
            )}

            {isCut && isHeightCut && (
              <text
                x={drawX + 3}
                y={finalDrawY + drawH / 2}
                fill="white"
                fontSize={currentFontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(-90, ${drawX + 3}, ${finalDrawY + drawH / 2})`}
                style={{ paintOrder: 'stroke', stroke: '#ef4444', strokeWidth: 2 }}
              >
                {hMm}
              </text>
            )}
          </g>
        );
      }
    }

    const openingsOverlay = mapSurface !== 'floor' ? svgOpenings.map((op, idx) => (
      <rect key={`op-${idx}`} x={op.x} y={op.y} width={op.w} height={op.h} fill="#ffffff" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" />
    )) : null;

    return (
      <div className="flex flex-col items-center w-full bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
        <div className="text-xl font-bold text-gray-800 dark:text-white mb-4">{activeRoomForMap.name} — {surfaceName}</div>
        <div className="flex items-center gap-4 w-full justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[500px] h-auto border-2 border-gray-800 dark:border-gray-500 bg-white">
            {tiles}
            {openingsOverlay}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="none" stroke="#1e293b" strokeWidth="3" />
          </svg>
        </div>
      </div>
    );
  };

  const renderStairMapSVG = () => {
    const sw = parseFloat(stairStepWidth) || 300;
    const L = parseFloat(stairWidth) || 1000;
    const sh = parseFloat(stairStepHeight) || 150;
    const ov = parseFloat(stairOverhang) || 0;
    
    const tileW = parseFloat(tileWidth) * 10 || 300;
    const tileH = parseFloat(tileHeight) * 10 || 300;
    const grout = parseFloat(groutWidth) || 2;

    const scale = 0.5;

    const drawSurface = (widthMm, heightMm, title) => {
      const wPx = widthMm * scale;
      const hPx = heightMm * scale;
      
      const cols = Math.ceil(widthMm / (tileW + grout));
      const rows = Math.ceil(heightMm / (tileH + grout));
      
      const tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (tileW + grout) * scale;
          const y = r * (tileH + grout) * scale;
          
          let curW = Math.min(tileW * scale, wPx - x);
          let curH = Math.min(tileH * scale, hPx - y);
          
          if (curW <= 0 || curH <= 0) continue;

          const isCutW = curW < tileW * scale - 0.1;
          const isCutH = curH < tileH * scale - 0.1;
          const isCut = isCutW || isCutH;

          const wMm = Math.round(curW / scale);
          const hMm = Math.round(curH / scale);

          let fontSize = 12;
          if (curW < 40 || curH < 40) fontSize = 10;
          if (curW < 25 || curH < 25) fontSize = 8;
          if (curW < 15 || curH < 15) fontSize = 6;

          tiles.push(
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={curW} height={curH} fill={isCut ? '#ef4444' : '#bfdbfe'} stroke="#475569" strokeWidth="1" />
              {isCut && curW > 20 && <text x={x + curW / 2} y={y + 3} fill="white" fontSize={fontSize} fontWeight="bold" textAnchor="middle" dominantBaseline="hanging" style={{ paintOrder: 'stroke', stroke: '#ef4444', strokeWidth: 2 }}>{wMm}</text>}
              {isCut && curH > 20 && <text x={x + 3} y={y + curH / 2} fill="white" fontSize={fontSize} fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90, ${x + 3}, ${y + curH / 2})`} style={{ paintOrder: 'stroke', stroke: '#ef4444', strokeWidth: 2 }}>{hMm}</text>}
            </g>
          );
        }
      }

      return (
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{title}</span>
          <svg width={wPx + 2} height={hPx + 2} className="border-2 border-gray-800 dark:border-gray-500 bg-white">
            {tiles}
            <rect x="0" y="0" width={wPx} height={hPx} fill="none" stroke="#1e293b" strokeWidth="2" />
          </svg>
          <div className="text-xs text-gray-500 mt-1">{widthMm} x {heightMm} мм</div>
        </div>
      );
    };

    return (
      <div className="flex flex-wrap gap-8 justify-center w-full bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
        {(stairCladdingType === 'full' || stairCladdingType === 'tread') && drawSurface(sw + ov, L, 'Проступь (вид сверху)')}
        {(stairCladdingType === 'full' || stairCladdingType === 'riser') && drawSurface(sh, L, 'Подступенок (вид спереди)')}
      </div>
    );
  };

  const downloadPDF = async (ref, name) => {
    if (!ref.current) return;
    setIsGeneratingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const canvas = await html2canvas(ref.current, { scale: 1.5, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (globalPdfFont) {
        pdf.addFileToVFS('Roboto-Regular.ttf', globalPdfFont);
        pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        pdf.setFont('Roboto');
      }

      pdf.setFontSize(16);
      pdf.text(`Карта раскладки: ${name}`, 10, 15);
      pdf.addImage(imgData, 'JPEG', 10, 25, pdfWidth - 20, pdfHeight);
      pdf.save(`Raskladka-${name}.pdf`);

    } catch (error) {
      console.error("Ошибка при создании PDF:", error);
      addToast('Ошибка при создании PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-24 md:pb-4">
      
      <div className="flex bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg w-fit mb-4">
        <button 
          onClick={() => { setCalcMode('surface'); setResult(null); setShowStairMap(false); }} 
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition ${calcMode === 'surface' ? 'bg-white dark:bg-[#1e293b] shadow text-primary' : 'text-gray-500'}`}
        >
          <Grid size={16} /> Пол / Стены
        </button>
        <button 
          onClick={() => { setCalcMode('stair'); setResult(null); setShowMap(false); }} 
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition ${calcMode === 'stair' ? 'bg-white dark:bg-[#1e293b] shadow text-primary' : 'text-gray-500'}`}
        >
          <Ruler size={16} /> Лестница
        </button>
      </div>

      {calcMode === 'surface' ? (
        <>
          <RoomSelector selectedId={selectedId} onSelect={handleRoomSelect} surface={surface === 'floor' ? 'floor' : 'walls'} />
          <div className="flex bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg w-fit">
            <button onClick={() => setSurface('floor')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition ${surface === 'floor' ? 'bg-white dark:bg-[#1e293b] shadow text-primary' : 'text-gray-500'}`}>
              <Grid size={16} /> Пол
            </button>
            <button onClick={() => setSurface('wall')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition ${surface === 'wall' ? 'bg-white dark:bg-[#1e293b] shadow text-primary' : 'text-gray-500'}`}>
              <LayoutGrid size={16} /> Стены
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Площадь (м²)</label>
                <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary outline-none font-bold text-lg text-primary bg-white dark:bg-[#0f172a]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ширина (см)</label><input type="number" step="0.1" value={tileWidth} onChange={(e) => setTileWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Высота (см)</label><input type="number" step="0.1" value={tileHeight} onChange={(e) => setTileHeight(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Укладка</label><select value={layout} onChange={(e) => setLayout(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"><option value="straight">Прямая</option><option value="diagonal">Диагональ</option></select></div>
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Шов (мм)</label><input type="number" step="0.5" value={groutWidth} onChange={(e) => setGroutWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Смещение X (см)</label><input type="number" step="0.5" value={offsetXcm} onChange={(e) => setOffsetXcm(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
                <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Смещение Y (см)</label><input type="number" step="0.5" value={offsetYcm} onChange={(e) => setOffsetYcm(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={handleCalc} className="flex-1 py-3 bg-primary text-white rounded-md flex items-center justify-center gap-2 font-bold hover:bg-blue-700"><Play size={18}/> Рассчитать</button>
                <button onClick={() => setShowMap(!showMap)} className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 font-bold border transition ${showMap ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  <LayoutTemplate size={18}/> Карта подрезки
                </button>
              </div>
            </div>

            <div>
              {!result ? (
                <div className="h-full bg-gray-50 dark:bg-[#0f172a] border border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 min-h-[200px]">Нажмите «Рассчитать»</div>
              ) : (
                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border"><span className="text-xs text-blue-600 block">Площадь с запасом</span><span className="text-xl font-bold text-gray-800 dark:text-white">{result.totalArea.toFixed(1)} м²</span></div>
                    <div className="bg-gray-50 dark:bg-[#1e293b] p-3 rounded-lg border"><span className="text-xs text-gray-500 block">Всего плиток</span><span className="text-xl font-bold text-gray-800 dark:text-white">{result.totalTiles} шт</span></div>
                  </div>
                  <div className="text-xs text-primary font-medium">Цена плитки: {getMaterialPrice('плитка', 'tile', 'material')} ₽/м²</div>
                  <button onClick={addToEstimate} disabled={isAdded} className={`w-full py-2.5 rounded-md mt-2 flex items-center justify-center gap-2 font-medium transition ${isAdded ? 'bg-green-100 text-green-700 border border-green-300 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    {isAdded ? <><Check size={18}/> Добавлено!</> : <><PlusCircle size={18}/> В смету</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {showMap && (
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Карта подрезки (размеры в мм)</h3>
                <button onClick={() => downloadPDF(mapRef, activeRoomForMap?.name || 'room')} disabled={isGeneratingPdf} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium text-white ${isGeneratingPdf ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}>
                  {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                  {isGeneratingPdf ? 'Создание PDF...' : 'Скачать PDF'}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 dark:bg-[#1e293b] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Комната</label>
                  <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="p-2 border rounded-md text-sm w-48 font-medium bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    <option value="">-- Выберите --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Поверхность</label>
                  <select value={mapSurface} onChange={(e) => setMapSurface(e.target.value)} className="p-2 border rounded-md text-sm w-48 font-medium bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    <option value="floor">Пол</option>
                    <option value="top">Задняя стена</option>
                    <option value="bottom">Передняя стена</option>
                    <option value="left">Левая стена</option>
                    <option value="right">Правая стена</option>
                  </select>
                </div>
              </div>

              {activeRoomForMap ? (
                <div ref={mapRef} className="p-8 bg-gray-100 dark:bg-[#0f172a] rounded-xl border border-gray-300 dark:border-gray-700 flex justify-center w-full">
                  {renderMapSVG()}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 font-medium">Выберите комнату для построения карты.</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">Параметры лестницы</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Количество ступеней</label>
                <input type="number" value={stairStepsCount} onChange={(e) => setStairStepsCount(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" placeholder="18" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Высота подступенка (мм)</label>
                <input type="number" value={stairStepHeight} onChange={(e) => setStairStepHeight(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ширина проступи (мм)</label>
                <input type="number" value={stairStepWidth} onChange={(e) => setStairStepWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ширина лестницы (мм)</label>
                <input type="number" value={stairWidth} onChange={(e) => setStairWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Что облицовываем?</label>
              <select value={stairCladdingType} onChange={(e) => setStairCladdingType(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <option value="full">Полную (ступени + подступенки)</option>
                <option value="tread">Только ступени (горизонталь)</option>
                <option value="riser">Только подступенки (вертикаль)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ширина плитки (см)</label><input type="number" value={tileWidth} onChange={(e) => setTileWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Высота плитки (см)</label><input type="number" value={tileHeight} onChange={(e) => setTileHeight(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Шов (мм)</label><input type="number" value={groutWidth} onChange={(e) => setGroutWidth(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div><label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Свес плитки (мм)</label><input type="number" value={stairOverhang} onChange={(e) => setStairOverhang(e.target.value)} className="w-full p-2.5 border rounded-md bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" /></div>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={handleCalc} className="flex-1 py-3 bg-primary text-white rounded-md flex items-center justify-center gap-2 font-bold hover:bg-blue-700"><Play size={18}/> Рассчитать</button>
              <button onClick={() => setShowStairMap(!showStairMap)} className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 font-bold border transition ${showStairMap ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <LayoutTemplate size={18}/> Карта подрезки
              </button>
            </div>
          </div>

          <div>
            {!result ? (
              <div className="h-full bg-gray-50 dark:bg-[#0f172a] border border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 min-h-[200px]">Нажмите «Рассчитать»</div>
            ) : (
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-xs text-teal-600 dark:text-teal-400 block font-semibold">Общая площадь</span>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{result.totalArea.toFixed(2)} м²</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1e293b] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-semibold">Плиток (с запасом)</span>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{result.totalTiles} шт</span>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#1e293b] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between"><span>Ступени (пол):</span><span>{result.treadArea.toFixed(2)} м²</span></div>
                  <div className="flex justify-between"><span>Подступенки:</span><span>{result.riserArea.toFixed(2)} м²</span></div>
                  <div className="flex justify-between"><span>Клей:</span><span>{result.glueBags} меш.</span></div>
                  <div className="flex justify-between"><span>Затирка:</span><span>{result.groutKg} кг</span></div>
                </div>
                <button onClick={addToEstimate} disabled={isAdded} className={`w-full py-2.5 rounded-md mt-2 flex items-center justify-center gap-2 font-medium transition ${isAdded ? 'bg-green-100 text-green-700 border border-green-300 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                  {isAdded ? <><Check size={18}/> Добавлено!</> : <><PlusCircle size={18}/> В смету</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {calcMode === 'stair' && showStairMap && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Карта подрезки ступеней (размеры в мм)</h3>
            <button onClick={() => downloadPDF(stairMapRef, 'stair')} disabled={isGeneratingPdf} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium text-white ${isGeneratingPdf ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}>
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {isGeneratingPdf ? 'Создание PDF...' : 'Скачать PDF'}
            </button>
          </div>
          <div ref={stairMapRef} className="p-8 bg-gray-100 dark:bg-[#0f172a] rounded-xl border border-gray-300 dark:border-gray-700 flex justify-center w-full">
            {renderStairMapSVG()}
          </div>
        </div>
      )}
    </div>
  );
}