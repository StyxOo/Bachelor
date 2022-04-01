import csv


data_path = "./fusion_GLOBAL_DATAFLOW_UNICEF_1.0_all.csv"


def print_countries(data):
    countries = []
    for line in data:
        if line[1] not in countries:
            countries.append(line[1])

    for country in countries:
        print(country)

    print(f"Number of individual regions: {len(countries)}")


def print_topics(data):
    topics = []
    for line in data:
        if line[2] not in topics:
            topics.append(line[2])

    for topic in topics:
        print(topic)

    print(f"Number of individual topics: {len(topics)}")


def print_topics_for_country(data, country):
    topics = []
    for line in data:
        if line[1] == country:
            if line[2] not in topics:
                topics.append(line[2])

    for topic in topics:
        print(topic)

    print(f"Number of individual topics in {country}: {len(topics)}")


if __name__ == '__main__':
    with open(data_path, mode='r') as file:
        data = csv.reader(file)

        # print_countries(data)
        # print_topics(data)
        print_topics_for_country(data, "UKR: Ukraine")
