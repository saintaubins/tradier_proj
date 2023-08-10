const backEndUrl = 'http://127.0.0.1:5001/';
//const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';

const profileButton = document.getElementById('profileButton');
    profileButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`${backEndUrl}user/profile`);
            const data = await response.json();

            const profile = data.message.profile;

            const dateCreated = new Date(profile.account.date_created);
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };
            const formattedDateCreated = dateCreated.toLocaleDateString(undefined, options);

            const lastUpdate = new Date(profile.account.last_update_date);
            const dtOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };
            const formattedLastUpdate = lastUpdate.toLocaleDateString(undefined, dtOptions);

            // Populate the HTML elements with the data
            document.getElementById('name').innerText = profile.name;
            document.getElementById('id').innerText = profile.id;
            document.getElementById('accountNumber').innerText = profile.account.account_number;
            document.getElementById('classification').innerText = profile.account.classification;
            document.getElementById('dateCreated').innerText = formattedDateCreated;
            document.getElementById('dayTrader').innerText = profile.account.day_trader;
            document.getElementById('optionLevel').innerText = profile.account.option_level;
            document.getElementById('status').innerText = profile.account.status;
            document.getElementById('type').innerText = profile.account.type;
            document.getElementById('lastUpdateDate').innerText = formattedLastUpdate;
        } catch (error) {
            console.error('Error occurred while fetching profile data:', error);
        }
    });

const balanceButton = document.getElementById('balanceButton');
balanceButton.addEventListener('click', async () => {
    try {
        const response = await fetch(`${backEndUrl}balances`);
        const data = await response.json();

        const balances = data.message.balances;

        // Populate the HTML elements with the data
        document.getElementById('optionShortValue').innerText = balances.option_short_value;
        document.getElementById('totalEquity').innerText = balances.total_equity;
        document.getElementById('accountNumber1').innerText = balances.account_number;
        document.getElementById('accountType').innerText = balances.account_type;
        document.getElementById('closePl').innerText = balances.close_pl;
        document.getElementById('currentRequirement').innerText = balances.current_requirement;
        document.getElementById('equity').innerText = balances.equity;
        document.getElementById('longMarketValue').innerText = balances.long_market_value;
        document.getElementById('marketValue').innerText = balances.market_value;
        document.getElementById('openPl').innerText = balances.open_pl;
        document.getElementById('optionLongValue').innerText = balances.option_long_value;
        document.getElementById('optionRequirement').innerText = balances.option_requirement;
        document.getElementById('pendingOrdersCount').innerText = balances.pending_orders_count;
        document.getElementById('shortMarketValue').innerText = balances.short_market_value;
        document.getElementById('stockLongValue').innerText = balances.stock_long_value;
        document.getElementById('totalCash').innerText = balances.total_cash;
        document.getElementById('unclearedFunds').innerText = balances.uncleared_funds;
        document.getElementById('pendingCash').innerText = balances.pending_cash;
        document.getElementById('dayTradeBuyingPower').innerText = balances.pdt.day_trade_buying_power;
        document.getElementById('fedCall').innerText = balances.pdt.fed_call;
        document.getElementById('maintenanceCall').innerText = balances.pdt.maintenance_call;
        document.getElementById('optionBuyingPower').innerText = balances.pdt.option_buying_power;
        document.getElementById('stockBuyingPower').innerText = balances.pdt.stock_buying_power;
        document.getElementById('stockShortValue').innerText = balances.pdt.stock_short_value;
    } catch (error) {
        console.error('Error occurred while fetching balances:', error);
    }
});




