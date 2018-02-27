import json
import csv
import re
from collections import defaultdict

capital_coord_data = json.load(open('world-topo.json'))

with open('map_figure_data.csv') as f:
	visitors_dict_lst = [{key: value for key, value in row.items()} for row in csv.DictReader(f)]


def extract_coordinates(capital_data_input):
	output_dict = {}
	geometries_list = capital_data_input["objects"]["countries"]["geometries"]
	for country_geo in geometries_list:
		lat = ""
		lon = ""
		country_name = country_geo["properties"]["name"]

		if country_name == "Brunei Darussalam":
			country_name = "Brunei"
		if country_name == "Viet Nam":
			country_name = "Vietnam"
		if "Ivoire" in country_name:
			country_name = "Cote d'Ivoire"
		if "Cura" in country_name:
			country_name = 'Cura\xc3\xa7ao'
		if country_name == "Congo, the Democratic Republic of the":
			country_name = "Democratic Republic of Congo"
		if country_name == "Lao People's Democratic Republic":
			country_name = "Laos"
		if country_name == "Palestine, State of":
			country_name = "Palestinian Territory"
		if country_name == "Sint Maarten (Dutch part)":
			country_name = "Sint Maarten"

		#in case of ex. "Taiwan, Province of China", extract only Taiwan
		country_name = country_name.split(", ")[0] if "Korea" not in country_name else country_name
		

		if "lat" in country_geo["properties"]:
			lat = country_geo["properties"]["lat"]
		if "lon" in country_geo["properties"]:
			lon = country_geo["properties"]["lon"]
		
		output_dict[country_name] = {"latitude": lat, "longitude": lon}
		#Since there is inconsistency in the map figure data, need to account for both names of Korea
		if country_name == "Korea, Democratic People's Republic of":
			output_dict["North Korea"] = {"latitude": lat, "longitude": lon}
		if country_name == "Korea, Republic of":
			output_dict["South Korea"] = {"latitude": lat, "longitude": lon}

	return output_dict




def clean_data(visitors_data_input,coordinates_input,country_num=50):
	#pick the top 50 hosting countries with the most daily visitors
	total_visitors_dict = {}
	counter = 0
	for country_pair_dict in visitors_data_input:
		hosting_country = country_pair_dict["Location"]
		#ex. "Korea, Republic of" and "Korea, Democratic People's Republic of" is not the case
		hosting_country = hosting_country.split(", ")[0] if "Korea" not in hosting_country else hosting_country

		daily_vis = re.sub(r'\s+', '', country_pair_dict["Avg_Daily_Visitors"])
		daily_vis = int(daily_vis) if daily_vis!="N/A" else 0

		if hosting_country!="NA" and hosting_country!="Europe":
			if hosting_country in total_visitors_dict:
				total_visitors_dict[hosting_country] += daily_vis
			else:
				total_visitors_dict[hosting_country] = daily_vis


	sorted_hosting_country_vis = sorted(total_visitors_dict.items(), key=lambda x: -x[1])

	top_countries = sorted_hosting_country_vis[:country_num]
	top_countries_total_vis = {i[0]:i[1] for i in top_countries}

	# build the dictionary
	output_dict = {host:{"destination":{}, "total_vis":top_countries_total_vis[host],"coordinates":{"latitude":coordinates_input[host]["latitude"],"longitude":coordinates_input[host]["longitude"]}} 
					for host,num in top_countries}

	for country_pair_dict in visitors_data_input:
		hosting_country = country_pair_dict["Location"]
		#ex. "Korea, Republic of" and "Korea, Democratic People's Republic of" is not the case
		hosting_country = hosting_country.split(", ")[0] if "Korea" not in hosting_country else hosting_country


		daily_vis = re.sub(r'\s+', '', country_pair_dict["Avg_Daily_Visitors"])
		daily_vis = int(daily_vis) if daily_vis!="N/A" else 0

		if hosting_country in top_countries_total_vis:
			destination_country = country_pair_dict["country"]
			#these are oversea territories/other regions of certain countries, not treated as a country in the topo json data
			if destination_country == "Gibraltar":
				destination_country = "United Kingdom"
			if destination_country == "Guadeloupe":
				destination_country = "France"
			if destination_country == "Martinique":
				destination_country = "France"
			if destination_country == "Mayotte":
				destination_country = "France"
			if destination_country == "Reunion":
				destination_country = "France"
			if destination_country == "Russia":
				destination_country = "Russian Federation"
			if destination_country == "US Virgin Islands":
				destination_country = "United States"

			#update the dict
			if destination_country not in output_dict[hosting_country]["destination"]:
				output_dict[hosting_country]["destination"][destination_country] = {"daily_vis":daily_vis, "longitude":coordinates_input[destination_country]["longitude"],"latitude":coordinates_input[destination_country]["latitude"]}

			else:
				output_dict[hosting_country]["destination"][destination_country]["daily_vis"] += daily_vis



	return output_dict



if __name__ == "__main__":
	coord = extract_coordinates(capital_coord_data)
	visitors = clean_data(visitors_dict_lst,coord)

	with open('map_figure_data_with_coord.json','w') as fp:
		json.dump(visitors,fp)


	#delete
	# count = 0
	# us = visitors["United States"]
	# for des in us["destination"]:
	# 	print type(des)

	# print count










