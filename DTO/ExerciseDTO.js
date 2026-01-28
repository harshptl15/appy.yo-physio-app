/**
 * ExerciseDTO holds an ID and exercise name.
 * Used to transfer exercise data between controller and DAO.
 */
class ExerciseDTO {
  /**
   * @param {{ id: number, exerciseName: string, tips: string, commonMistakes: string, image: string , video: string, sets: number, reps:number , skillLevel:string , tempo: string, position: string, equipment:string, goal: boolean  }} data
   */
  constructor({ id, exerciseName , tips, commonMistakes, image , video, sets, reps , skillLevel , tempo, position, equipment, goal}) {
    this.id = id;
    this.exerciseName = exerciseName;
    this.tips = tips;
    this.commonMistakes = commonMistakes;
    this.image = image;
    this.video = video;
    this.sets = sets;
    this.reps = reps;
    this.skillLevel = skillLevel;
    this.tempo = tempo;
    this.position = position;
    this.equipment = equipment;
    this.goal = goal;
  }

  get id() {
    return this._id;
  }

  set id(value) {
 
    this._id = value;
  }

  get exerciseName() {
    return this._exerciseName;
  }

  set exerciseName(value) {

    this._exerciseName = value;
  }

  get tips() {
     return this._tips; 
    }
  set tips(value) {
     this._tips = value; 
    }

  get commonMistakes() {
     return this._commonMistakes; 
    }
  set commonMistakes(value) {
     this._commonMistakes = value; 
  }

  get image() {
     return this._image; 
    }

  set image(value) {
     this._image = value;
     }

  get video() {
     return this._video;
     }
  set video(value) { 
    this._video = value; 
  }

  get sets() {
     return this._sets; 
    }
  set sets(value) { 
     this._sets = value; 
    }

  get reps() {
     return this._reps; 
    }
  set reps(value) {
     this._reps = value; }

  get skillLevel() { 
    return this._skillLevel; 
  }
  set skillLevel(value) { 
     this._skillLevel = value; 
   }

  get tempo() { 
    return this._tempo; 
  }

  set tempo(value) { 
    this._tempo = value; 
  }

  get position() { 
    return this._position; }
  set position(value) { this._position = value; 

  }
  
  get equipment() { 
    return this._equipment; 
  }
  set equipment(value) {
     this._equipment = value; 
    }
  
  get goal() {
  return this._goal;
}

set goal(value) {
   this._goal = value;
   }
}

//export the ExerciseDTO class
module.exports = { ExerciseDTO};
