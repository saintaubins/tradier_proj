import config, requests, json
import pandas as pd



headers = {
    'Authorization': 'Bearer {}'.format(config.SANDBOX_ACCESS_TOKEN), 
    'Accept': 'application/json'
}

order_url = '{}accounts/{}/orders'.format(config.API_BASE_URL, config.SANDBOX_ACCOUNT_NUMBER)

def get_quotes(symbols = 'TSLA') -> dict:
    url = "{}markets/quotes".format(config.API_BASE_URL)

    response = requests.get(url,
        params={'symbols': symbols},
        headers=headers
    )
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return None

# print(get_quotes())

def get_options_chain(symbol= 'TSLA', exp_dt= '2023-07-28') -> dict:
    options_url = '{}markets/options/chains'.format(config.API_BASE_URL)

    response = requests.get(options_url,
        params={'symbol': symbol, 'expiration': exp_dt},
        headers=headers
    )

    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()
        #print(data_dict)
        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        print(response)
        return None

def get_options_chain(symbol='TSLA', exp_dt='2023-07-28', option_type= None):
    options_url = '{}markets/options/chains'.format(config.API_BASE_URL)

    response = requests.get(options_url,
        params={'symbol': symbol, 'expiration': exp_dt},
        headers=headers
    )

    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()
       
    if option_type is not None:
        filtered_options = [option for option in data_dict['options']['option'] if option['option_type'] == option_type]
        data_dict['options']['option'] = filtered_options

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message':'Failed to retrieve data', 'status code: ' : response.status_code}

print(get_options_chain())

def get_option_strike_price(symbol= 'TSLA', exp_dt= '2023-07-28') -> dict:
    strikes_url = '{}markets/options/strikes'.format(config.API_BASE_URL)
    
    response = requests.get(strikes_url,
    params={'symbol': symbol, 'expiration': exp_dt},
    headers=headers
)
   
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return None

# print(get_option_strike_price())


def place_option_order(symbol= 'TSLA', option_symbol= 'TSLA230728P00020000', qty= '1') -> dict:
    
    try:
        response = requests.post(
            order_url,
            data={
                'class': 'option', 
                'symbol': symbol, 
                'option_symbol': option_symbol, 
                'side': 'buy_to_open', 
                'quantity': qty, 
                'type': 'market', 
                'duration': 'day'},
            headers=headers
        )

        return response.json()
    except Exception as e:
        print('could not place order', e)

# print(place_option_order())

def get_orders() -> dict:
    response = requests.get(order_url, headers=headers)
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()

        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return None

# print(get_orders())