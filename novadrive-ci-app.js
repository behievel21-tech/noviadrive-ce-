// NOVADRIVE CI — Logique JavaScript dédiée (catalogue, location, Wave, WhatsApp, PDF & Admin)

const NOVADRIVE_CONFIG = {
  brandName: "NOVADRIVE CI",
  slogan: "Votre prochaine voiture, notre priorité.",
  waveNumber: "05 85 87 80 13",
  whatsappNumber: "2250585878013",
  deliveryPolicy: "Livraison gratuite",
  defaultAdminCode: "ADMIN2026"
};

/**
 * Calcule la durée en jours (minimum 1) et le montant total d'une location en FCFA.
 * @param {string} startDate - Date début (YYYY-MM-DD)
 * @param {string} endDate - Date fin (YYYY-MM-DD)
 * @param {number} dailyRateFcfa - Prix journalier en FCFA
 * @returns {{ days: number, totalFcfa: number, delivery: string }}
 */
export function computeRentalQuote(startDate, endDate, dailyRateFcfa) {
  const rate = Math.max(0, Number(dailyRateFcfa) || 0);
  let days = 1;

  if (startDate && endDate) {
    const d1 = new Date(`${startDate}T00:00:00`);
    const d2 = new Date(`${endDate}T00:00:00`);
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    if (!Number.isNaN(diffDays) && diffDays >= 1) {
      days = diffDays;
    }
  }

  return {
    days,
    totalFcfa: days * rate,
    delivery: NOVADRIVE_CONFIG.deliveryPolicy
  };
}

/**
 * Formate un montant en Francs CFA.
 * @param {number} amount
 * @returns {string}
 */
export function formatFcfa(amount) {
  return `${Number(amount || 0).toLocaleString("fr-FR")} FCFA`;
}

/**
 * Construit le lien WhatsApp officiel (+2250585878013) à partir d'une commande ou réservation.
 * @param {object} order
 * @returns {string}
 */
export function buildOrderWhatsappLink(order) {
  const isRental = order.type === "location";
  const lines = [
    `*${NOVADRIVE_CONFIG.brandName} — NOUVELLE COMMANDE*`,
    `Référence : *${order.id}*`,
    `Type : *${isRental ? "LOCATION" : "ACHAT"}*`,
    `Véhicule : *${order.vehicleLabel}*`,
    `Montant : *${formatFcfa(order.amount)}* (${NOVADRIVE_CONFIG.deliveryPolicy})`,
    isRental
      ? `Location : du ${order.rentalStart} au ${order.rentalEnd} (${order.rentalDays} j) à ${order.rentalTime} — Lieu : ${order.rentalPickup}`
      : null,
    `Client : *${order.client?.fullName || ""}* (${order.client?.clientType || "Particulier"})`,
    `Organisation : ${order.client?.orgName || "—"}`,
    `Téléphone : *${order.client?.phone || ""}*`,
    `Ville / Commune : ${order.client?.cityCommune || ""} — Adresse : ${order.client?.address || ""}`,
    `Paiement : Wave (${NOVADRIVE_CONFIG.waveNumber}) | Réf : *${order.waveRef || ""}* | Statut : *${order.paymentStatus || "En attente"}*`
  ].filter(Boolean);

  return `https://wa.me/${NOVADRIVE_CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * Prépare les métadonnées d'un reçu en distinguant reçu de commande et preuve de paiement vérifiée.
 * @param {object} order
 * @returns {object}
 */
export function buildReceiptMetadata(order) {
  const isPaymentConfirmed = order.paymentStatus === "Confirmé";
  return {
    company: NOVADRIVE_CONFIG.brandName,
    slogan: NOVADRIVE_CONFIG.slogan,
    receiptType: isPaymentConfirmed ? "REÇU DE PAIEMENT CONFIRMÉ" : "REÇU DE COMMANDE",
    isVerifiedPaymentProof: isPaymentConfirmed,
    waveNumber: NOVADRIVE_CONFIG.waveNumber,
    delivery: NOVADRIVE_CONFIG.deliveryPolicy,
    notice: isPaymentConfirmed
      ? "Paiement Wave vérifié et confirmé par l'administration."
      : "Reçu de commande : ne vaut pas preuve de paiement vérifiée tant que le paiement Wave est En attente."
  };
}
