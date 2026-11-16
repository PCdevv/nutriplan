import { Heart } from "lucide-react";
import { useIsFavorited } from "../../hooks/useFavorites";

/**
 * FavoriteButton — Heart button with server & localStorage persistence.
 *
 * @param {Object} props
 * @param {string|number} [props.mealId]
 * @param {Function} [props.onToggle]
 */
export default function FavoriteButton({ mealId, onToggle }) {
    const { isFavorited, loading, toggleFavorite } = useIsFavorited(mealId);

    const handleClick = async (e) => {
        e.stopPropagation();
        const result = await toggleFavorite();
        if (result && onToggle) onToggle(result);
    };

    return (
        <button
            type="button"
            className={`fav-btn ${isFavorited ? "fav-btn--active" : ""}`}
            onClick={handleClick}
            disabled={loading}
            aria-label={
                isFavorited ? "Hapus dari favorit" : "Simpan ke favorit"
            }
            title={isFavorited ? "Hapus dari favorit" : "Simpan ke favorit"}
        >
            <Heart
                size={18}
                fill={isFavorited ? "#ef4444" : "none"}
                stroke={isFavorited ? "#ef4444" : "currentColor"}
            />
        </button>
    );
}
