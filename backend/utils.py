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
        return {'message: ': f'Failed to retrieve data. Status code: {response.status_code}'}

# print(get_quotes())

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
        return {'message':f'Failed to retrieve data status code: {response.status_code}'}

# print(get_options_chain())

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
        return {'message: ': f'Failed to retrieve data. Status code: {response.status_code}'}

# print(get_option_strike_price())


def place_option_order(symbol= 'TSLA', option_symbol= 'TSLA230728P00020000', qty= '5') -> dict:
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
                'duration': 'gtc'},
            headers=headers
        )
        return response.json()
    except Exception as e:
        print('could not place order', e)
        return {'message: ': f'could not place order',
                'raw_error:': f'{e}'}

# print(place_option_order())

def sell_option_order(symbol= 'TSLA', option_symbol= 'TSLA230728P00020000', qty= '5') -> dict:
    try:
        response = requests.post(
            order_url,
            data={
                'class': 'option', 
                'symbol': symbol, 
                'option_symbol': option_symbol, 
                'side': 'sell_to_close', 
                'quantity': qty, 
                'type': 'market', 
                'duration': 'day'},
            headers=headers
        )
        return response.json()
    except Exception as e:
        print(f'could not sell order Error: {e}')
        return {'message: ': f'could not sell order Error: {e}'}
    

def cancel_order(order_id: str) -> dict:
    try:
        response = requests.delete(
            f'https://sandbox.tradier.com/v1/accounts/{config.SANDBOX_ACCOUNT_NUMBER}/orders/{order_id}',
            headers=headers
        )
        print('response.status_code', response.status_code)
        if response.status_code == 200:
            if response.text == 'order already in finalized state: filled':
                return {'message': 'order already in finalized state: filled'}
            else:
                return response.json()
        else:
            return {'message': f'Failed to retrieve data.',
                    'response_status_code': f'{response.status_code}',
                    'response_text':f'{response.text}',
                    'response_content':f'{response.content}',
                    'response_is_permanent_redirect':f'{response.is_permanent_redirect}',
                    'response_ok':f'{response.ok}',
                    }
    except Exception as e:
        print('error -> ', e)
        return {'message': f'Failed to retrieve data. Error: {e}'}

# cancel_order('7177432')

def modify_order(order_id: str) -> dict:
    response = requests.put(
        f'https://sandbox.tradier.com/v1/accounts/{config.SANDBOX_ACCOUNT_NUMBER}/orders/{order_id}',
    data={'type': 'market', 
          'duration': 'gtc',
          'price': '1.00', 
          'stop': '1.00'
          },
    headers=headers
    )
    print('response.text -> ', response.text)
    print('response.status_code -> ', response.status_code)
    print('message', f'Failed to retrieve data.')  
    print('response_status_code', f'{response.status_code}')
    print('response_text', f'{response.text}')
    print('response_content', f'{response.content}')
    print('response_is_permanent_redirect', f'{response.is_permanent_redirect}')
    print('response_ok',f'{response.ok}')

# modify_order('7169581')

def get_orders() -> dict:
    response = requests.get(order_url, headers=headers)
    # Check if the response was successful before converting to DataFrame
    if response.status_code == 200:
        data_dict = response.json()
        print('data_dict -> ', data_dict)
        return data_dict
    else:
        print('Failed to retrieve data. Status code:', response.status_code)
        return {'message: ': f'Failed to retrieve data. Status code:'+ response.status_code}

# print(get_orders())