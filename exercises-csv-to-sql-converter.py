import pandas as pd

#import the data from the csv file
dataFile = pd.read_csv("./exercise_datasheet.csv")
#get the header names
headers = dataFile.columns
print(headers)
bodyParts = []
exercises = []
associative = []
mySqlStr = ""

#format number so if it's nan it becomes null
def formatNumber(number):
     if pd.isna(number):
          return "NULL"
     else:
          return str(number)


#if string is nan, return empty string
def nanToEmptyString(string):
     if pd.isna(string):
          return ""
     return str(string)

#deal with single quotes in sql strings
def sql_escape(val):
    return str(val).replace("'", "''")  # escape single quotes


#format string if nan or contains single quotes
def formatString(string):
    string = nanToEmptyString(string)
    string = sql_escape(string)
    return string

def insertBodyPart(bodyPart, exerciseId):
    if bodyPart not in bodyParts:
            #add body part to body parts array
            bodyParts.append(bodyPart)
    associative.append({
          "exerciseId": exerciseId + 1,
          "bodyPartId": bodyParts.index(bodyPart) + 1
    })

# def tempoHoldTimeGetTempo(string):
#      if pd.isna(string):
#           return ""
#      report = ""
#      #replace the en dash with a hyphen
#      string = string.replace("–", "-")

def stringContainsCategory(string):
    string = string.lower()
    report = ""
    if "strengthen" in string:
        report = "strengthen"
    if "stretch" in string:
        report = "stretch"
    return report

def isGymOnly(string):
    if pd.isna(string): 
         return 0
    report = 0
    
    string = string.lower()
    if string in "gym":
          report = 1
    return report

for index, row in dataFile.iterrows():
    bodyPartBeforeSplit = row[headers[1]]
    bodyPartsAfterSplit = bodyPartBeforeSplit.split("/")
    for bodyPart in bodyPartsAfterSplit:
         insertBodyPart(bodyPart, index)
    exercises.append( {
         "bodyPart": bodyParts.index(bodyPart),
         "name": formatString(row['Exercise']),
         "category": stringContainsCategory(row[3]),
         "isGymOnly": isGymOnly(row["Gym or At Home"]),
         "tips": formatString(row["Tips to Do Exercise"]),
         "commonMistakes": formatString(row["Common Mistakes"]),
         "position": formatString(row["Exercise Position"]),
         "equipmentNeeded": formatString(row["Equipment Needed"]),
         "skillLevel": formatString(row["Skill Level"]),
         "tempo": formatString(row["Tempo / Hold Time"]),
         "sets": formatNumber(row["Sets"]),
         "reps": formatString(row["Reps"])

    })

def addBodyPartsToSql(sqlStr):
     #loop through the body parts array
     for bodyPart in bodyParts:
            #add the body part to the sql string
            sqlStr += f"INSERT INTO Muscle_Group (name) VALUES ('{bodyPart}');\n"
     return sqlStr

def addExercisesToSql(sqlStr):
        #loop through the exercises array
        for exercise in exercises:
            #add the exercise to the sql string
            sqlStr += f"INSERT INTO Exercise (name, category, is_gym_only, tips, common_mistakes, image_link, video_link, position, equipment_needed, skill_level, tempo, sets, reps) VALUES ('{exercise['name']}', '{exercise['category']}', {exercise['isGymOnly']}, '{exercise['tips']}', '{exercise['commonMistakes']}', NULL, NULL, '{exercise['position']}', '{exercise['equipmentNeeded']}', '{exercise['skillLevel']}', '{exercise['tempo']}', {exercise['sets']}, '{exercise['reps']}');\n"
        return sqlStr

def addAssociativeToSql(sqlStr):
    #loop through the associative array
    for associativeItem in associative:
        #add the associative item to the sql string
        sqlStr += f"INSERT INTO Exercise_Muscle_Group (Exercise_id, Muscle_Group_id) VALUES ({associativeItem['exerciseId']}, {associativeItem['bodyPartId']});\n"
    return sqlStr

# print ("headers: ", headers)
# print("Body Parts: ", bodyParts)
# print ("Exercises: ", exercises)
# print ("Associative: ", associative)
mySqlStr = addBodyPartsToSql(mySqlStr)
mySqlStr = addExercisesToSql(mySqlStr)
mySqlStr = addAssociativeToSql(mySqlStr)
print("SQL String:\n", mySqlStr)

#export the sql string to a file
with open("DML.sql", "w", encoding="utf-8") as file:
    file.write(mySqlStr)