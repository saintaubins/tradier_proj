import config, requests

def get_options_chain(symbol):
    options_chain_url = f'https://sandbox.tradier.com/v1/markets/options/chains'
    params = {'symbol': symbol}
    headers = {'Authorization': f'Bearer {config.SANDBOX_ACCESS_TOKEN}'}

    try:
        options_chain_response = requests.get(options_chain_url, params=params, headers=headers)
        options_chain_data = options_chain_response.json()

        if options_chain_response.status_code == 200:
            options_data = options_chain_data['options']['option']
            expiration_dates = set(option['expiration_date'] for option in options_data)

            return expiration_dates
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

# Example usage
symbol = 'TSLA'  # Replace with the desired symbol
expiration_dates = get_options_chain(symbol)

print('Expiration Dates:', expiration_dates)
