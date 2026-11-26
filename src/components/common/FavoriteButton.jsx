import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useIsFavorited } from "../../hooks/useFavorites";

/**
 * FavoriteButton — Heart button with server & localStorage persistence.
 * Includes loading state and double-click protection while toggling.
 *
 * @param {Object} props
 * @param {string|number} [props.mealId]
 * @param {Function} [props.onToggle]
 */
export default function FavoriteButton({ mealId, onToggle }) {
    const { isFavorited, loading, toggleFavorite } = useIsFavorited(mealId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBusy = loading || isSubmitting;

    const handleClick = async (e) => {
        e.stopPropagation();
        if (isBusy) return;

        setIsSubmitting(true);
        try {
            const result = await toggleFavorite();
            if (result && onToggle) onToggle(result);
        } finally {
            setIsSubmitting(false);
        }
    };

    const label = isBusy
        ? "Menyimpan perubahan favorit..."
        : isFavorited
          ? "Hapus dari favorit"
          : "Simpan ke favorit";

    return (
        <button
            type="button"
            className={`fav-btn ${isFavorited ? "fav-btn--active" : ""} ${isBusy ? "fav-btn--loading" : ""}`}
            onClick={handleClick}
            disabled={isBusy}
            aria-busy={isBusy}
            aria-label={label}
            title={label}
        >
            {isBusy ? (
                <Loader2 size={18} className="spin" />
            ) : (
                <Heart
                    size={18}
                    fill={isFavorited ? "#ef4444" : "none"}
                    stroke={isFavorited ? "#ef4444" : "currentColor"}
                />
            )}
        </button>
    );
}
