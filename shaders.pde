import com.jogamp.newt.event.KeyEvent;

PShader shader;
PShader blackShader;

Camera camera;

Vec4 movementDelta = new Vec4(0,0,0,0);
float[] rotationDelta = new float[6];

float smoothedFrameRate = 0;

class Vec4 {
  public float x, y, z, w;
  
  public Vec4(float xn, float yn, float zn, float wn) {
    x = xn;
    y = yn;
    z = zn;
    w = wn;
  }
  
  public Vec4() {
    this(0,0,0,0);
  }
  
  float[] get() {
    float[] ret = {x, y, z, w};
    return ret;
  }
  
  Vec4 add(Vec4 v) {
    return new Vec4( x+v.x,  y+v.y, z+v.z, w+v.w );
  }
  
  Vec4 sub(Vec4 v) {
    return new Vec4( x-v.x,  y-v.y, z-v.z, w-v.w );
  }
  
  Vec4 mul(float f) {
    return new Vec4( x*f,  y*f, z*f, w*f );
  }
}

void setup() {
  size(640, 640, P2D);
  frameRate(60);
  textSize(20);
  noStroke();

  shader = loadShader("shader.frag");
  blackShader = loadShader("black.frag");
  
  camera = new Camera(0.0, 0.0, -5.0, 0.0);
}

boolean errorPrinted = false;
void draw() {
  processControls();
  
  if( frameCount % 60 <= 1) {
    shader = loadShader("shader.frag");
  }

  shader.set("u_resolution", float(width), float(height));
  shader.set("u_mouse", float(mouseX), float(mouseY));
  shader.set("u_time", millis() / 1000.0);
  
  shader.set("camera_position", camera.getPosition().x, camera.getPosition().y, camera.getPosition().z, camera.getPosition().w);
  shader.set("camera_rotation", camera.getRotation().x, camera.getRotation().y, camera.getRotation().z, camera.getRotation().w);
  shader.set("camera_angles_one", camera.getAngles()[0], camera.getAngles()[1], camera.getAngles()[2]);
  shader.set("camera_angles_two", camera.getAngles()[3], camera.getAngles()[4], camera.getAngles()[5]);
  
  try {
    shader(shader);
    errorPrinted = false;
  }
  catch(Exception e) {
    if(!errorPrinted) {
      print(e);
      errorPrinted = true;
      shader(blackShader);
    }
  }
  rect(0,0,width,height);
  resetShader();
  smoothedFrameRate = 1.1/2 * frameRate + 0.9/2 * smoothedFrameRate;

  text((int) smoothedFrameRate, 5, 25);
}

void keyPressed() {
  processKeystrokes(1);
}

void keyReleased() {
  processKeystrokes(-1);
}

void processKeystrokes(int pressed) {

  if(key == CODED && keyCode == UP)
    movementDelta.y += pressed;
  if(key == CODED && keyCode == DOWN)
    movementDelta.y -= pressed;
  if(key == CODED && keyCode == RIGHT)
    movementDelta.w += pressed;
  if(key == CODED && keyCode == LEFT)
    movementDelta.w -= pressed;
  
  if(Character.toLowerCase(key) == 'w')
    movementDelta.z += pressed;
  if(Character.toLowerCase(key) == 's')
    movementDelta.z -= pressed;
  if(Character.toLowerCase(key) == 'd')
    movementDelta.x += pressed;
  if(Character.toLowerCase(key) == 'a')
    movementDelta.x -= pressed;
    
  if(Character.toLowerCase(key) == 'i') // Looking up
    rotationDelta[4] += pressed;
  if(Character.toLowerCase(key) == 'k') // Looking down
    rotationDelta[4] -= pressed;
  if(Character.toLowerCase(key) == 'l') // Looking left
    rotationDelta[5] += pressed;
  if(Character.toLowerCase(key) == 'j') // Looking right
    rotationDelta[5] -= pressed;
    
  if(Character.toLowerCase(key) == ' ') // Reset rotation
    camera.reset();
}

void processControls() {
  // Camera movement
  if(movementDelta.y > 0)
    camera.move("y");
  if(movementDelta.y < 0)
    camera.move("-y");
  if(movementDelta.w > 0)
    camera.move("w");
  if(movementDelta.w < 0)
    camera.move("-w");
  if(movementDelta.z > 0)
    camera.move("z");
  if(movementDelta.z < 0)
    camera.move("-z");
  if(movementDelta.x > 0)
    camera.move("x");
  if(movementDelta.x < 0)
    camera.move("-x");
  
   //TODO
  // Sepee:- Camera rotation normal: xz and yz - extra: xw and yw - scroll: zw
  if(rotationDelta[4] > 0) // Looking up
    camera.rotate(0, 0, 0, ROTATION_SPEED, 0, 0);
  if(rotationDelta[4] < 0) // Looking down
    camera.rotate(0, 0, 0,-ROTATION_SPEED, 0, 0);
  if(rotationDelta[5] > 0) // Looking right
    camera.rotate(0, 0, 0, 0, ROTATION_SPEED, 0);
  if(rotationDelta[5] < 0) // Looking left
    camera.rotate(0, 0, 0, 0,-ROTATION_SPEED, 0);
  // if(Character.toLowerCase(key) == 'j') // Looking left
  //   camera.rotate(-ROTATION_SPEED, 0.0, 0.0, 0.0);
  // if(Character.toLowerCase(key) == 'l') // Looking right
  //   camera.rotate(ROTATION_SPEED, 0.0, 0.0, 0.0);
  // if(Character.toLowerCase(key) == 'u') // Looking 4th negative
  //   camera.rotate(0.0, 0.0, 0.0, -ROTATION_SPEED);
  // if(Character.toLowerCase(key) == 'o') // Looking 4th positive
  //   camera.rotate(0.0, 0.0, 0.0, ROTATION_SPEED);
  
}
