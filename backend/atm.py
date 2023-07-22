import config, requests

def get_current_market_price(api_token, symbol):
    # Function to get the current market price using the Tradier API
    base_url = 'https://sandbox.tradier.com/v1/markets/quotes'
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Accept': 'application/json'
    }
    params = {'symbols': symbol}

    response = requests.get(base_url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'quotes' in data and isinstance(data['quotes'], dict):
            quote = data['quotes']
            return float(quote['last']) if 'last' in quote else None
   
    return None

def get_atm_call_option(options_chain, current_market_price):
    # Function to find the at-the-money call option from the options chain
    call_options = [option for option in options_chain if option['option_type'] == 'call']
    atm_call_option = min(call_options, key=lambda x: abs(float(x['strike']) - current_market_price))
    print('call options ->', call_options)
    print('atm_call_option -> ', atm_call_option)
    return atm_call_option

def place_atm_call_option_order(api_token, symbol, quantity):
    # Function to place an at-the-money call option order using the Tradier API
    base_url = f'https://sandbox.tradier.com/v1/accounts/{config.SANDBOX_ACCOUNT_NUMBER}/orders'  # Replace <YOUR_ACCOUNT_NUMBER> with your account number
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    # Step 1: Get the current market price
    current_market_price = get_current_market_price(api_token, symbol)
   
    try:
        options_chain_url = f'https://sandbox.tradier.com/v1/markets/options/chains'
        params = {'symbol': symbol, 'expiration': '2023-07-21'}

        options_chain_response = requests.get(options_chain_url, params=params, headers=headers)
        print('options_chain_response ->', options_chain_response)

        # Check if the response status code is 200 (OK)
        if options_chain_response.status_code == 200:
            # Check if the response content is not empty
            if options_chain_response.content:
                options_chain = options_chain_response.json()
                print('options_chain ->', options_chain)
            else:
                print('Empty response content. There was no options chain provided.')
                return None
        else:
            print('Failed to retrieve options chain. Status code:', options_chain_response.status_code)
            return None

    except requests.exceptions.RequestException as e:
        print('Request Exception:', e)
        return None
    except requests.exceptions.JSONDecodeError as e:
        print('JSON Decode Error:', e)
        return None
    except Exception as e:
        print('Error:', e)
        return None

    

    # # Step 3: Get the at-the-money call option
    # atm_call_option = get_atm_call_option(options_chain['options']['option'], current_market_price)

    # # Step 4: Place the order for the at-the-money call option
    # order_data = {
    #     'class': 'option',
    #     'symbol': symbol,
    #     'option_symbol': atm_call_option['symbol'],
    #     'side': 'buy_to_open',
    #     'quantity': str(quantity),
    #     'type': 'market',
    #     'duration': 'gtc'  # Good 'Til Canceled order
    # }

    # response = requests.post(base_url, json=order_data, headers=headers)

    # if response.status_code == 201:
    #     return response.json()
    # else:
    #     print('there was not a valid response ln 67')
    #     return None

# Example usage:
api_token = config.SANDBOX_ACCESS_TOKEN
symbol = 'TSLA'
quantity = 1

response = place_atm_call_option_order(api_token, symbol, quantity)
print(response)
