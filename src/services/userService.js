// ---------------------------------------------------------------------------
// User identity — generates and persists a unique client identifier in
// localStorage so meal plans and favorites can associate data with
// this browser session without requiring a complex auth barrier.
// ---------------------------------------------------------------------------

const USER_IDENTIFIER_KEY = "nutriplan_user_id";
const USER_PROFILE_KEY = "nutriplan_user_profile";

/**
 * Check if a string is a valid UUID
 */
const isValidUUID = (str) =>
    typeof str === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        str,
    );

/**
 * Generate a standard RFC4122 v4 UUID
 */
const generateUUID = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Return a stable, randomly-generated user identifier (UUID).
 */
export const getUserIdentifier = () => {
    try {
        let userId = localStorage.getItem(USER_IDENTIFIER_KEY);
        if (!userId || !isValidUUID(userId)) {
            userId = generateUUID();
            localStorage.setItem(USER_IDENTIFIER_KEY, userId);
        }
        return userId;
    } catch {
        return generateUUID();
    }
};

/**
 * Return user profile object stored in localStorage, including calorie goals.
 */
export const getUserProfile = () => {
    try {
        const raw = localStorage.getItem(USER_PROFILE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        /* corrupted data — fall through to default */
    }
    return {
        username: "Puteri Citra Dewi | 21120124130056 | Kelompok 31",
        avatar: null,
        bio: "Menjaga pola makan seimbang dan hidup sehat setiap hari.",
        calorieGoal: 2000,
        proteinGoal: 120,
        carbsGoal: 250,
        fatGoal: 65,
        weight: 65,
        height: 170,
        userId: getUserIdentifier(),
    };
};

/**
 * Persist an updated profile object.
 */
export const saveUserProfile = (profile) => {
    try {
        const data = {
            ...profile,
            userId: getUserIdentifier(),
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data));
        return { success: true, data };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

export const updateAvatar = (avatarBase64) => {
    const profile = getUserProfile();
    profile.avatar = avatarBase64;
    return saveUserProfile(profile);
};

export default {
    getUserIdentifier,
    getUserProfile,
    saveUserProfile,
    updateAvatar,
};
