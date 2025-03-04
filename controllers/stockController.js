const yahooFinance = require('yahoo-finance2').default;

exports.getStockData = async (req, res) => {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Please provide both from and to dates." });
    }

    try {
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        const adjustedTo = toDate.toISOString().split('T')[0];

        const result = await yahooFinance.historical(symbol, {
            period1: from,
            period2: adjustedTo,
            interval: '1d',
        });

        if (result.length === 0) {
            return res.json([]);
        }

        const formattedData = result.map(entry => {
            const istDate = new Date(entry.date);
            istDate.setHours(istDate.getHours() + 5);
            istDate.setMinutes(istDate.getMinutes() + 30);
            const formattedDate = istDate.toISOString().split('T')[0];

            const priceChange = (entry.close - entry.open).toFixed(2);
            const percentageChange = ((priceChange / entry.open) * 100).toFixed(2);

            return {
                date: formattedDate,
                open: entry.open.toFixed(2),
                high: entry.high.toFixed(2),
                low: entry.low.toFixed(2),
                close: entry.close.toFixed(2),
                change: priceChange,
                changePercentage: `${percentageChange}%`,
                volume: entry.volume.toLocaleString()
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
};
