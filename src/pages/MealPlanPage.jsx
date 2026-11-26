import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Plus,
    Coffee,
    Sun,
    Moon,
    Cookie,
    AlertCircle,
    Loader,
    Copy,
    CheckCircle2,
} from "lucide-react";
import CalorieRing from "../components/meal/CalorieRing";
import MacroBar from "../components/meal/MacroBar";
import MealPlanCard from "../components/meal/MealPlanCard";
import { getUserProfile } from "../services/userService";
import {
    formatPlanDate,
    formatCalories,
    getTodayDateString,
} from "../utils/calorieUtils";

/**
 * MealPlanPage — Core daily planner dashboard.
 */
export default function MealPlanPage({ mealPlanState, onNavigateToCatalog }) {
    const {
        selectedDate,
        setSelectedDate,
        totals,
        grouped,
        loading,
        error,
        refetch,
        removeFromPlan,
        updateServings,
        duplicateMealPlan,
    } = mealPlanState;

    const [profile] = useState(() => getUserProfile());
    const [showDuplicateForm, setShowDuplicateForm] = useState(false);
    const [targetDate, setTargetDate] = useState(() => getTodayDateString());
    const [replaceExisting, setReplaceExisting] = useState(false);
    const [duplicating, setDuplicating] = useState(false);
    const [duplicateNotice, setDuplicateNotice] = useState(null);

    // Date navigation helpers
    const handleShiftDate = (days) => {
        const current = new Date(selectedDate + "T00:00:00");
        current.setDate(current.getDate() + days);
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, "0");
        const d = String(current.getDate()).padStart(2, "0");
        setSelectedDate(`${y}-${m}-${d}`);
    };

    const handleResetToday = () => {
        setSelectedDate(getTodayDateString());
    };

    const handleDuplicatePlan = async (e) => {
        e.preventDefault();
        if (!targetDate || targetDate === selectedDate) return;

        setDuplicating(true);
        setDuplicateNotice(null);
        const res = await duplicateMealPlan(
            selectedDate,
            targetDate,
            replaceExisting,
        );
        setDuplicating(false);

        if (res.success) {
            setDuplicateNotice({
                type: "success",
                text: `Menu berhasil diduplikasi ke ${formatPlanDate(targetDate)}.`,
                targetDate,
            });
            setShowDuplicateForm(false);
        } else {
            setDuplicateNotice({
                type: "error",
                text: res.message || "Gagal menduplikasi menu.",
            });
        }
    };

    const sections = [
        {
            id: "breakfast",
            title: "Sarapan",
            sub: "Breakfast",
            icon: Coffee,
            items: grouped.breakfast || [],
        },
        {
            id: "lunch",
            title: "Makan Siang",
            sub: "Lunch",
            icon: Sun,
            items: grouped.lunch || [],
        },
        {
            id: "dinner",
            title: "Makan Malam",
            sub: "Dinner",
            icon: Moon,
            items: grouped.dinner || [],
        },
        {
            id: "snack",
            title: "Cemilan Sehat",
            sub: "Snack",
            icon: Cookie,
            items: grouped.snack || [],
        },
    ];

    return (
        <div className="planner-page">
            {/* Date Header / Bar */}
            <div className="date-nav-bar">
                <button
                    type="button"
                    className="date-nav-btn"
                    onClick={() => handleShiftDate(-1)}
                    aria-label="Hari sebelumnya"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="date-nav-center">
                    <Calendar size={18} className="text-primary" />
                    <span className="date-nav-label">
                        {formatPlanDate(selectedDate)}
                    </span>
                    {selectedDate == getTodayDateString() && (
                        <button
                            type="button"
                            className="today-pill"
                            onClick={handleResetToday}
                        >
                            Hari Ini
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="date-nav-btn"
                    onClick={() => handleShiftDate(1)}
                    aria-label="Hari berikutnya"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Duplicate Meal Plan Bar (hidden when selectedDate is today) */}
            {selectedDate !== getTodayDateString() && (
                <div className="duplicate-plan-box">
                    <div className="duplicate-plan-header">
                        <div className="duplicate-plan-info">
                            <Copy size={16} className="text-primary" />
                            <span>
                                Salin menu dari{" "}
                                <strong>{formatPlanDate(selectedDate)}</strong>
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() => {
                                setShowDuplicateForm((prev) => !prev);
                                setDuplicateNotice(null);
                            }}
                        >
                            {showDuplicateForm ? "Batal" : "Duplikat Menu"}
                        </button>
                    </div>

                    {showDuplicateForm && (
                        <form
                            className="duplicate-plan-form"
                            onSubmit={handleDuplicatePlan}
                        >
                            <div className="duplicate-plan-fields">
                                <label className="duplicate-field">
                                    <span>Tanggal Tujuan</span>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) =>
                                            setTargetDate(e.target.value)
                                        }
                                        required
                                    />
                                </label>

                                <label className="duplicate-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={replaceExisting}
                                        onChange={(e) =>
                                            setReplaceExisting(e.target.checked)
                                        }
                                    />
                                    <span>
                                        Ganti menu yang sudah ada di tanggal
                                        tujuan
                                    </span>
                                </label>
                            </div>

                            <div className="duplicate-plan-actions">
                                <button
                                    type="submit"
                                    className="btn btn--primary btn--sm"
                                    disabled={
                                        duplicating ||
                                        !targetDate ||
                                        targetDate === selectedDate
                                    }
                                >
                                    {duplicating ? (
                                        <>
                                            <Loader
                                                size={14}
                                                className="spin"
                                            />{" "}
                                            Menduplikasi...
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} /> Duplikat Sekarang
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Notifications */}
            {duplicateNotice && (
                <div
                    className={`toast ${
                        duplicateNotice.type === "success"
                            ? "toast--success"
                            : "toast--error"
                    }`}
                >
                    {duplicateNotice.type === "success" ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <AlertCircle size={18} />
                    )}
                    <span>{duplicateNotice.text}</span>
                    {duplicateNotice.type === "success" &&
                        duplicateNotice.targetDate && (
                            <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => {
                                    setSelectedDate(duplicateNotice.targetDate);
                                    setDuplicateNotice(null);
                                }}
                            >
                                Lihat
                            </button>
                        )}
                </div>
            )}

            {error && (
                <div className="toast toast--error">
                    <AlertCircle size={18} /> {error}
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={refetch}
                    >
                        Muat Ulang
                    </button>
                </div>
            )}

            {/* Daily Progress Widgets */}
            <section className="dashboard-widgets-grid">
                <CalorieRing
                    consumed={totals.calories}
                    goal={profile.calorieGoal || 2000}
                />
                <MacroBar
                    protein={totals.protein}
                    carbs={totals.carbs}
                    fat={totals.fat}
                    proteinGoal={profile.proteinGoal || 120}
                    carbsGoal={profile.carbsGoal || 250}
                    fatGoal={profile.fatGoal || 65}
                />
            </section>

            {/* Meal Sections */}
            <section className="meal-sections-list">
                {loading && totals.count === 0 ? (
                    <div className="state-box">
                        <Loader size={28} className="spin text-primary" />
                        <p>Memuat rencana makan...</p>
                    </div>
                ) : (
                    sections.map((sec) => {
                        const Icon = sec.icon;
                        const secTotalCal = sec.items.reduce(
                            (acc, it) =>
                                acc +
                                Math.round(
                                    Number(it.meal?.calories || 0) *
                                        Number(it.servings || 1),
                                ),
                            0,
                        );

                        return (
                            <div key={sec.id} className="meal-section-block">
                                <div className="section-header">
                                    <div className="section-title-wrap">
                                        <div className="section-icon-badge">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h3 className="section-title">
                                                {sec.title}
                                            </h3>
                                            <span className="section-sub">
                                                {sec.sub}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="section-header-right">
                                        <span className="section-cal-badge">
                                            {formatCalories(secTotalCal)}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn--outline btn--sm btn-add-meal"
                                            onClick={() =>
                                                onNavigateToCatalog &&
                                                onNavigateToCatalog()
                                            }
                                            title={`Tambah menu ke ${sec.title}`}
                                        >
                                            <Plus size={14} /> Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Items list */}
                                <div className="section-body">
                                    {sec.items.length === 0 ? (
                                        <div className="empty-section-hint">
                                            <span>
                                                Belum ada menu yang direncanakan
                                                untuk {sec.title.toLowerCase()}.
                                            </span>
                                            {/* <button
                        type="button"
                        className="link-btn"
                        onClick={() => onNavigateToCatalog && onNavigateToCatalog(sec.title)}
                      >
                        Pilih dari katalog
                      </button> */}
                                        </div>
                                    ) : (
                                        <div className="plan-items-stack">
                                            {sec.items.map((it) => (
                                                <MealPlanCard
                                                    key={it.id}
                                                    planItem={it}
                                                    onRemove={removeFromPlan}
                                                    onUpdateServings={
                                                        updateServings
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
