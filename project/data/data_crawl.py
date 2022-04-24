import csv


data_path = "./unicef/fusion_GLOBAL_DATAFLOW_UNICEF_1.0_all.csv"


if __name__ == '__main__':
    with open(data_path, mode='r') as file:
        data = csv.reader(file)

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
