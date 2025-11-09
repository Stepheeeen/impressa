export const convertUsdToNaira = (usdAmount: number): number => {
    const exchangeRate = 750; // Example exchange rate
    return Math.round(usdAmount * exchangeRate);
}