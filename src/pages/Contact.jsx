import { Mail, Globe, MessageSquare } from 'lucide-react'

export default function Contact() {
  return (
    <div className="page">
      <h1 className="display">Pusat Bantuan &amp; Kontak</h1>
      <p className="lede">
        Punya pertanyaan seputar panduan gizi atau kendala teknis aplikasi NutriPlan?
        Hubungi tim pengembang kami.
      </p>

      <div className="card-box" style={{ marginTop: '24px' }}>
        <ul className="contact-list">
          <li className="contact-item">
            <Mail size={20} className="text-primary" />
            <div>
              <strong>Email Dukungan</strong>
              <p>support@nutriplan.app</p>
            </div>
          </li>
          <li className="contact-item">
            <Globe size={20} className="text-primary" />
            <div>
              <strong>Website Komunitas</strong>
              <p>https://nutriplan.app</p>
            </div>
          </li>
          <li className="contact-item">
            <MessageSquare size={20} className="text-primary" />
            <div>
              <strong>Praktek Pengembangan Perangkat Bergerak (PWA II)</strong>
              <p>Teknik Informatika — 2026</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
