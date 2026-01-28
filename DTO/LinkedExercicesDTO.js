/**
 * LikedExercisesDTO holds the favourites link between a user and an exercise.
 */
class LikedExercisesDTO {
  /**
   * @param {{ id: number, user: number, exercise: number }} data
   */
  constructor({ id, user, exercise }) {
    this.id = id;
    this.user = user;
    this.exercise = exercise;
  }

  get id() { 
         return this._id; 
        }

  set id(value) {
         this._id = v; 
        }

  get user() { 
         return this._user; 
        }
  set user(value) { 
         this._user = value; 
        }

  get exercise() {
         return this._exercise;
         }
  set exercise(value) {
         this._exercise = value; 
        }
}

module.exports = { LikedExercisesDTO };
