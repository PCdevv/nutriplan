export default function About() {
  return (
    <div className="page">
      <h1 className="display">Tentang NutriPlan</h1>
      <p className="lede">
        NutriPlan adalah aplikasi Progressive Web App (PWA) modern yang dirancang untuk
        membantu Anda merencanakan pola makan bergizi seimbang dan memantau target kalori harian
        dengan cepat, mudah, dan tetap dapat diakses meski tanpa sambungan internet (offline).
      </p>

      <div className="card-box" style={{ marginTop: '24px' }}>
        <h3 className="section-title">Fitur Unggulan</h3>
        <ul className="about-features-list">
          <li>
            <strong>Perencanaan Menu Harian:</strong> Atur santapan sarapan, makan siang,
            makan malam, hingga cemilan sehat sesuai kalender.
          </li>
          <li>
            <strong>Pelacak Kalori &amp; Makronutrisi:</strong> Visualisasi lingkaran progres kalori
            dan breakdown rasio protein, karbohidrat, dan lemak.
          </li>
          <li>
            <strong>Katalog Nutrisi Lengkap:</strong> Akses rincian gizi berbagai hidangan lokal
            maupun internasional.
          </li>
          <li>
            <strong>PWA Offline First:</strong> Tetap berfungsi penuh di mana pun Anda berada,
            dengan instalasi langsung ke layar utama ponsel atau desktop.
          </li>
        </ul>
      </div>
    </div>
  )
}
