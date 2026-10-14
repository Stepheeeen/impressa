// Set NEXT_PUBLIC_API_URL once the API has its own domain (https://api.impressaenterprise.com/api).
// Falls back to the Render address so nothing breaks before that DNS exists.
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://impressa-7rao.onrender.com/api"
