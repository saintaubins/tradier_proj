import utils

# 1. place trade.
# 2. if success capture the trade info from the trade.
# option_symbol, type, side, qty, duration.
# 3. create a constant loop to see market behavior, i.e. ema signal.
# 4. when signal says sell, call function to sell.
# 5 view trade on a graph.


async def place_trade_capture_data(option_symbol, qty, type, duration, side) -> dict:
    current_trade_to_close = {
        'option_symbol': '',
        'type': 'market',
        'side': 'sell_to_close',
        'qty': '',
        'duration': 'gtc'
    }

    placed_trade = await utils.place_option_order(
        'symbol', 'exp_dt', option_symbol, qty,
        side, type, duration, 'price', 'stop')

    if placed_trade.message.order.status == 'ok':
        current_trade_to_close = {
            'option_symbol': option_symbol,
            'type': 'market',
            'side': 'sell_to_close',
            'qty': qty,
            'duration': 'gtc'
        }

    return placed_trade, current_trade_to_close


async def main_function():
    # ... other code ...
    result = await place_trade_capture_data(option_symbol, qty, type, duration, side)
    # Use the result returned by place_trade_capture_data here
