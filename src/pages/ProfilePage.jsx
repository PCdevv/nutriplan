import { useState } from "react";
import {
    User,
    Copy,
    Check,
    Save,
    Heart,
    FileText,
    Camera,
    Play,
    Flame,
    Scale,
} from "lucide-react";
import userService from "../services/userService";
import { useFavorites } from "../hooks/useFavorites";

const getActiveDraftCount = () => {
    try {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("nutriplan_draft_")) {
                count++;
            }
        }
        return count;
    } catch {
        return 0;
    }
};

/**
 * ProfilePage — User profile, body metrics, and daily calorie target settings.
 */
export default function ProfilePage({ onReplaySplash }) {
    const [profile, setProfile] = useState(() => userService.getUserProfile());
    const [username, setUsername] = useState(
        profile.username || "Puteri Citra Dewi | 21120124130056 | Kelompok 31",
    );
    const [bio, setBio] = useState(profile.bio || "");
    const [avatar, setAvatar] = useState(profile.avatar || null);

    // Target metrics
    const [calorieGoal, setCalorieGoal] = useState(profile.calorieGoal || 2000);
    const [proteinGoal, setProteinGoal] = useState(profile.proteinGoal || 120);
    const [carbsGoal, setCarbsGoal] = useState(profile.carbsGoal || 250);
    const [fatGoal, setFatGoal] = useState(profile.fatGoal || 65);
    const [weight, setWeight] = useState(profile.weight || 65);
    const [height, setHeight] = useState(profile.height || 170);

    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState("");

    const { favorites } = useFavorites();
    const [draftCount] = useState(getActiveDraftCount);

    // BMI calculation
    const bmi =
        height > 0 && weight > 0
            ? (weight / ((height / 100) * (height / 100))).toFixed(1)
            : null;

    const getBmiStatus = (val) => {
        if (!val) return "";
        const num = Number(val);
        if (num < 18.5) return "Berat Kurang";
        if (num < 24.9) return "Normal / Ideal";
        if (num < 29.9) return "Kelebihan Berat";
        return "Obesitas";
    };

    const handleCopyId = () => {
        if (profile.userId) {
            navigator.clipboard.writeText(profile.userId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setFeedback("Ukuran foto profil maksimal 2MB.");
            setTimeout(() => setFeedback(""), 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            setAvatar(base64);
            userService.updateAvatar(base64);
            setFeedback("Foto profil berhasil diperbarui.");
            setTimeout(() => setFeedback(""), 3000);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const updated = {
            ...profile,
            username:
                username.trim() ||
                "Puteri Citra Dewi | 21120124130056 | Kelompok 31",
            bio: bio.trim(),
            avatar,
            calorieGoal: Number(calorieGoal) || 2000,
            proteinGoal: Number(proteinGoal) || 120,
            carbsGoal: Number(carbsGoal) || 250,
            fatGoal: Number(fatGoal) || 65,
            weight: Number(weight) || 65,
            height: Number(height) || 170,
        };

        const result = userService.saveUserProfile(updated);
        if (result.success) {
            setProfile(result.data);
            setFeedback(
                "Pengaturan profil dan target nutrisi berhasil disimpan!",
            );
            setTimeout(() => setFeedback(""), 3000);
        } else {
            setFeedback("Gagal menyimpan profil.");
        }
    };

    return (
        <div className="profile-page">
            <section
                className="masthead"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h1 className="display">Profil Pengguna</h1>
                    <p className="lede">
                        Kelola target kalori harian, proporsi makronutrisi, dan
                        identitas Anda.
                    </p>
                </div>
                {onReplaySplash && (
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={onReplaySplash}
                        title="Putar ulang animasi intro"
                    >
                        <Play size={14} /> Putar Intro
                    </button>
                )}
            </section>

            {feedback && (
                <div className="toast toast--success">
                    <Check size={18} /> {feedback}
                </div>
            )}

            {/* User Card */}
            <div className="profile-card">
                <div className="profile-card-top">
                    <div className="avatar-wrap">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={profile.username}
                                className="avatar-img"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                <User size={36} className="text-primary" />
                            </div>
                        )}
                        <label
                            htmlFor="avatar-file-input"
                            className="avatar-upload-btn"
                            title="Ubah foto"
                        >
                            <Camera size={14} />
                            <input
                                id="avatar-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden-file-input"
                            />
                        </label>
                    </div>

                    <div className="profile-identity">
                        <h2 className="profile-user-name">
                            {profile.username ||
                                "Puteri Citra Dewi | 21120124130056 | Kelompok 31"}
                        </h2>
                        <div className="profile-id-row">
                            <span className="mono-badge">
                                ID: {profile.userId?.substring(0, 8)}…
                            </span>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={handleCopyId}
                                title="Salin User ID"
                            >
                                {copied ? (
                                    <Check size={14} className="text-primary" />
                                ) : (
                                    <Copy size={14} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="profile-stats">
                    <div className="stat-item">
                        <Heart size={20} className="stat-icon text-danger" />
                        <div className="stat-val">{favorites.length}</div>
                        <div className="stat-label">Menu Favorit</div>
                    </div>
                    <div className="stat-item">
                        <Flame size={20} className="stat-icon text-primary" />
                        <div className="stat-val">{calorieGoal}</div>
                        <div className="stat-label">Target Kalori / Hari</div>
                    </div>
                    <div className="stat-item">
                        <Scale size={20} className="stat-icon text-secondary" />
                        <div className="stat-val">{bmi ? `${bmi}` : "—"}</div>
                        <div className="stat-label">
                            BMI ({getBmiStatus(bmi)})
                        </div>
                    </div>
                    <div className="stat-item">
                        <FileText
                            size={20}
                            className="stat-icon text-secondary"
                        />
                        <div className="stat-val">{draftCount}</div>
                        <div className="stat-label">Draf Tersimpan</div>
                    </div>
                </div>
            </div>

            {/* Profile & Target Form */}
            <form onSubmit={handleSaveProfile} className="profile-form">
                <h3 className="section-title">
                    Target &amp; Kebutuhan Gizi Harian
                </h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="prof-name" className="form-label">
                            Nama Panggilan
                        </label>
                        <input
                            id="prof-name"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prof-cal" className="form-label">
                            Target Kalori Harian (kkal)
                        </label>
                        <input
                            id="prof-cal"
                            type="number"
                            value={calorieGoal}
                            onChange={(e) => setCalorieGoal(e.target.value)}
                            step="50"
                            min="800"
                            max="5000"
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                {/* Macros Goals */}
                <div
                    className="form-grid form-grid--3"
                    style={{ marginTop: "10px" }}
                >
                    <div className="form-group">
                        <label htmlFor="prof-pro" className="form-label">
                            Target Protein (g)
                        </label>
                        <input
                            id="prof-pro"
                            type="number"
                            value={proteinGoal}
                            onChange={(e) => setProteinGoal(e.target.value)}
                            min="0"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prof-crb" className="form-label">
                            Target Karbohidrat (g)
                        </label>
                        <input
                            id="prof-crb"
                            type="number"
                            value={carbsGoal}
                            onChange={(e) => setCarbsGoal(e.target.value)}
                            min="0"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prof-fat" className="form-label">
                            Target Lemak (g)
                        </label>
                        <input
                            id="prof-fat"
                            type="number"
                            value={fatGoal}
                            onChange={(e) => setFatGoal(e.target.value)}
                            min="0"
                            className="form-input"
                        />
                    </div>
                </div>

                {/* Height and Weight */}
                <div className="form-grid" style={{ marginTop: "10px" }}>
                    <div className="form-group">
                        <label htmlFor="prof-weight" className="form-label">
                            Berat Badan (kg)
                        </label>
                        <input
                            id="prof-weight"
                            type="number"
                            step="0.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prof-height" className="form-label">
                            Tinggi Badan (cm)
                        </label>
                        <input
                            id="prof-height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: "10px" }}>
                    <label htmlFor="prof-bio" className="form-label">
                        Catatan Diet / Motivasi
                    </label>
                    <textarea
                        id="prof-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={2}
                        className="form-textarea"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn--primary"
                    style={{ marginTop: "10px" }}
                >
                    <Save size={16} /> Simpan Pengaturan
                </button>
            </form>
        </div>
    );
}
