export const whatsappDisplay = "0789448107";
export const whatsappInternational = "250789448107";

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${whatsappInternational}${text}`;
}
