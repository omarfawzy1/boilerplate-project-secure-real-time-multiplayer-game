import Collectible from "./Collectible.mjs"

class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = 20;
    this.height = 20;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y -= speed
      break;
      case 'down':
        this.y += speed
      break;
      case 'left':
        this.x -= speed
      break;
      case 'right':
        this.x += speed
      break;
      default:
      break;
    }
  } 

  collision(item) {
    if(item instanceof Collectible){
      return this.doOverlap(
        {xl1: this.x,yl1: this.y},
        {xr1: this.x + this.width,yr1: this.y + this.height},
        {xl2: item.x, yl2: item.y},
        {xr2: item.x + 25,yr2: item.y + 25}
      )
    }
  }

  /** @param {array} arr */
  calculateRank(arr) {
    let rank = arr.length
    arr.forEach(player => {
      if(player.score < this.score){
        rank -= 1;
      }
    });
    return rank + 1;
  }

  doOverlap({xl1, yl1}, {xr1, yr1}, {xl2, yl2}, {xr2, yr2})
  {
    if (xl1 == xr1 || yl1 == yr1 || xl2 == xr2 || yl2 == yr2)
      return false;
  
    if (xl1 > xr2 || xl2 > xr1)
      return false;
    if (yr1 < yl2 || yr2 < yl1)
      return false;
    return true;
  }
}

export default Player;
