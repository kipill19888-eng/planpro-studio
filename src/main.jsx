import './silenceWarnings' // 👈 самый первый импорт — до всего остального
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { YMInitializer } from 'react-yandex-metrika'
import './index.css'
import App from './App.jsx'

const YM_COUNTER_ID = 113789820;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <YMInitializer
        accounts={[YM_COUNTER_ID]}
        options={{
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          ecommerce: "dataLayer"
        }}
      />
      <App />
    </BrowserRouter>
  </StrictMode>,
)