const yahooFinance = require('yahoo-finance2').default;

exports.getStockData = async (req, res) => {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Please provide both from and to dates." });
    }

    try {
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1); // Adjust for inclusive range
        const adjustedTo = toDate.toISOString().split('T')[0];

        // Fetch data using chart() instead of deprecated historical()
        const result = await yahooFinance.chart(symbol, {
            period1: from,
            period2: adjustedTo,
            interval: '1d',
        });

        if (!result || !result.timestamp || result.timestamp.length === 0) {
            return res.json([]);
        }

        const formattedData = result.timestamp.map((timestamp, index) => {
            const istDate = new Date(timestamp * 1000); // Convert Unix timestamp to JS Date
            istDate.setHours(istDate.getHours() + 5); // Convert UTC to IST
            istDate.setMinutes(istDate.getMinutes() + 30);
            const formattedDate = istDate.toISOString().split('T')[0];

            const open = result.indicators.quote[0].open[index] || 0;
            const high = result.indicators.quote[0].high[index] || 0;
            const low = result.indicators.quote[0].low[index] || 0;
            const close = result.indicators.quote[0].close[index] || 0;
            const volume = result.indicators.quote[0].volume[index] || 0;

            const priceChange = (close - open).toFixed(2);
            const percentageChange = ((priceChange / open) * 100).toFixed(2);

            return {
                date: formattedDate,
                open: open.toFixed(2),
                high: high.toFixed(2),
                low: low.toFixed(2),
                close: close.toFixed(2),
                change: priceChange,
                changePercentage: `${percentageChange}%`,
                volume: volume.toLocaleString()
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
};
