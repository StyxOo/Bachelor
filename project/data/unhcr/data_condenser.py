import json


def write_csv(data, file_name):
    with open(file_name, mode='w') as out_file:
        for row in data:
            out_file.write(f'{row[0]},{row[1]}\n')


def condense_daily_refugees():
    file_path = 'total_refugees_daily.json'
    condensed_data = [["date", "refugees"]]
    with open(file_path, mode='r') as json_file:
        raw_data = json.load(json_file)
        for timestamp in raw_data['data']['timeseries']:
            date = timestamp['data_date']
            refugees = timestamp['individuals']
            condensed_data.append([date, refugees])
            print(f'At the {date} there are already {refugees} total refugees!')
    write_csv(condensed_data, 'total_refugees_daily_condensed.csv')


def condense_per_country_totals():
    file_path = 'total_refugees_per_country.json'
    condensed_data = [["country", "refugees"]]
    with open(file_path, mode='r') as json_file:
        raw_data = json.load(json_file)
        for entry in raw_data['data']:
            country = entry['geomaster_name']
            refugees = entry['individuals']
            condensed_data.append([country, refugees])
            print(f'{refugees} refugees fled to {country} so far!')
    write_csv(condensed_data, 'total_refugees_per_country_condensed.csv')


if __name__ == '__main__':
    condense_daily_refugees()
    condense_per_country_totals()
