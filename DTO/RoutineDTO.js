/**
 * RoutineDTO holds the link between a user and an exercise.
 */
class RoutineDTO {
  /**
   * @param {{ id: number, exerciseId: number, userId: number, goal:boolean }} data
   */
  constructor({ id, exerciseId, userId, goal }) {
    this.id = id;
    this.exerciseId = exerciseId;
    this.userId = userId;
    this.goal = goal;
  }

  get id() {
         return this._id; 
         }
  set id(value) {
          this._id = value; 
        }

  get exerciseId() { 
         return this._exerciseId; 
        }
  set exerciseId(value) {
         this._exerciseId = value; 
        }

  get userId() { 
         return this._userId; 
        }
  set userId(value) {
         this._userId = value; 
        }
  get goal() {
        return this._goal;
       }

set goal(value) {
  
        this._goal = value;
       }
}

module.exports = { RoutineDTO };
