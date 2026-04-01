import { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import OrderPage from './pages/OrderPage'
import HistoryPage from './pages/HistoryPage'
import SupportPage from './pages/SupportPage'

const DEFAULT_FUELS = [
  { id: 'g91', name: 'แก๊สโซฮอล์ 91', price: 99.99, tomorrow: 35.94, change: 0, color: '#16a34a' },
  { id: 'g95', name: 'แก๊สโซฮอล์ 95', price: 99.99, tomorrow: 38.44, change: 0, color: '#dc2626' },
  { id: 'e20', name: 'แก๊สโซฮอล์ E20', price: 99.99, tomorrow: 33.34, change: 0, color: '#d97706' },
  { id: 'e85', name: 'แก๊สโซฮอล์ E85', price: 99.99, tomorrow: 28.66, change: 0, color: '#059669' },
  { id: 'b7', name: 'ดีเซล B7', price: 99.99, tomorrow: 29.94, change: 0, color: '#ea580c' },
]

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [fuels, setFuels] = useState(DEFAULT_FUELS)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    const fetchKapookPrices = async () => {
      try {
        const url = encodeURIComponent('https://gasprice.kapook.com/gasprice.php');
        const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let pttHtml = '';
        const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, article');
        for (let i = 0; i < headers.length; i++) {
          if (headers[i].textContent.includes('ปตท.') || headers[i].textContent.includes('PTT')) {
            pttHtml = headers[i].parentElement.innerHTML;
            break;
          }
        }
        if (!pttHtml) pttHtml = doc.body.innerHTML;

        const getPrice = (namePattern) => {
          const regex = new RegExp(`${namePattern}[^\\d]*?(\\d{2}\\.\\d{2})`, 'i');
          const match = pttHtml.match(regex);
          return match ? parseFloat(match[1]) : null;
        };

        const g91 = getPrice('แก๊สโซฮอล์\\s*91') || 99.99;
        const g95 = getPrice('แก๊สโซฮอล์\\s*95') || 99.99;
        const e20 = getPrice('แก๊สโซฮอล์\\s*E20') || 99.99;
        const e85 = getPrice('แก๊สโซฮอล์\\s*E85') || 99.99;
        const d7 = getPrice('ดีเซล\\s*B7') || 99.99;

        const hasTomorrowChange = html.includes('พรุ่งนี้') || html.includes('ปรับราคา');
        let changeStatus = 0;
        if (html.includes('ปรับลด')) changeStatus = -0.40;
        if (html.includes('ปรับขึ้น')) changeStatus = 0.40;

        setFuels([
          { id: 'g91', name: 'แก๊สโซฮอล์ 91', price: g91, tomorrow: g91 + changeStatus, change: changeStatus, color: '#019B91' },
          { id: 'g95', name: 'แก๊สโซฮอล์ 95', price: g95, tomorrow: g95 + changeStatus, change: changeStatus, color: '#0078B7' },
          { id: 'e20', name: 'แก๊สโซฮอล์ E20', price: e20, tomorrow: e20 + changeStatus, change: changeStatus, color: '#F2572B' },
          { id: 'e85', name: 'แก๊สโซฮอล์ E85', price: e85, tomorrow: e85 + changeStatus, change: changeStatus, color: '#CC2129' },
          { id: 'b7', name: 'ดีเซล B7', price: d7, tomorrow: d7 + (html.includes('ปรับขึ้น ดีเซล B7') ? 0.5 : 0), change: (html.includes('ปรับขึ้น ดีเซล B7') ? 0.5 : 0), color: '#282C69' },
        ]);

        setLastUpdate(new Date().toLocaleDateString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok'
        }));
        setLoadingPrices(false);
      } catch (error) {
        console.error('Error fetching Kapook prices:', error);
        setLoadingPrices(false);
      }
    };

    fetchKapookPrices();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} fuels={fuels} loading={loadingPrices} lastUpdate={lastUpdate} />
      case 'order': return <OrderPage fuels={fuels} onNavigate={setCurrentPage} />
      case 'history': return <HistoryPage />
      case 'support': return <SupportPage />
      default: return <Home onNavigate={setCurrentPage} fuels={fuels} loading={loadingPrices} lastUpdate={lastUpdate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  )
}

export default App
