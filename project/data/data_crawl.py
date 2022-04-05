import csv


data_path = "./unicef/fusion_GLOBAL_DATAFLOW_UNICEF_1.0_all.csv"


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
        # print_topics_for_country(data, "UKR: Ukraine")

        # Get topics by country
        # and get countries by topic
        by_country = {}
        by_topic = {}
        for line in data:
            country = line[1]
            topic = line[2]
            if country in by_country.keys():
                if topic not in by_country[country]:
                    by_country[country].append(topic)
            else:
                by_country[country] = [topic]

            if topic in by_topic.keys():
                if country not in by_topic[topic]:
                    by_topic[topic].append(country)
            else:
                by_topic[topic] = [country]

        # Filter topics by country "Ukraine"
        country = "UKR: Ukraine"
        possible_topics = by_country[country]
        for topic in possible_topics:
            print(f"There are {len(by_topic[topic])} countries for topic: {topic.split(':', 1)[1]}")

    print("Fin")


