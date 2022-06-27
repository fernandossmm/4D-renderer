
final float CAMERA_SPEED = 0.07;
final float ROTATION_SPEED = 0.025;

public class Camera {
  private Vec4 position;
  private Vec4 rotation;
  
  Camera(Vec4 position, Vec4 rotation) {
    this.position = position;
    this.rotation = rotation;
  }
  
  Camera(Vec4 position) {
    this(position, new Vec4(0.0, 0.0, 1.0, 0.0));
  }
  
  Camera(float x, float y, float z, float w) {
    this(new Vec4(x, y, z, w));
  }
  
  void resetRotation() {
    rotation = new Vec4(0.0, 0.0, 1.0, 0.0);
  }
  
  void rotate(float[] rotDelta) {
    rotate(rotDelta[0], rotDelta[1], rotDelta[2], rotDelta[3], rotDelta[4], rotDelta[5]);
  }
  
  void rotate(float zwRot, float ywRot, float xwRot, float yzRot, float xzRot, float xyRot) {
    
    this.rotation = rotateVector(rotation, zwRot, ywRot, xwRot, yzRot, xzRot, xyRot);
  }
  
  private Vec4 rotateVector(Vec4 v, float zwRot, float ywRot, float xwRot, float yzRot, float xzRot, float xyRot) {
        
    float[][] zwRotationMatrix = {{          1,          0,          0,          0},
                                  {          0,          1,          0,          0},
                                  {          0,          0, cos(zwRot),-sin(zwRot)},
                                  {          0,          0, sin(zwRot), cos(zwRot)}};
                        
    float[][] ywRotationMatrix = {{          1,          0,          0,          0},
                                  {          0, cos(ywRot),          0,-sin(ywRot)},
                                  {          0,          0,          1,          0},
                                  {          0, sin(ywRot),          0, cos(ywRot)}};
          
    float[][] xwRotationMatrix = {{ cos(xwRot),          0,          0,-sin(xwRot)},
                                  {          0,          1,          0,          0},
                                  {          0,          0,          1,          0},
                                  { sin(xwRot),          0,          0, cos(xwRot)}};
    
    float[][] yzRotationMatrix = {{          1,          0,          0,          0},
                                  {          0, cos(yzRot),-sin(yzRot),          0},
                                  {          0, sin(yzRot), cos(yzRot),          0},
                                  {          0,          0,          0,          1}};
                                  
    float[][] xzRotationMatrix = {{ cos(xzRot),          0,-sin(xzRot),          0},
                                  {          0,          1,          0,          0},
                                  { sin(xzRot),          0, cos(xzRot),          0},
                                  {          0,          0,          0,          1}};
                                  
    float[][] xyRotationMatrix = {{ cos(xyRot),-sin(xyRot),          0,          0},
                                  {-sin(xyRot), cos(xyRot),          0,          0},
                                  {          0,          0,          1,          0},
                                  {          0,          0,          0,          1}};
    
    SimpleMatrix rotationMatrix = ((new SimpleMatrix(zwRotationMatrix))
          .mult((new SimpleMatrix(ywRotationMatrix))
          .mult((new SimpleMatrix(xwRotationMatrix))
          .mult((new SimpleMatrix(yzRotationMatrix))
          .mult((new SimpleMatrix(xzRotationMatrix))
          .mult((new SimpleMatrix(xyRotationMatrix))))))));
    
    float[][] t = {v.get()};
    SimpleMatrix rot = (new SimpleMatrix(t)).mult(rotationMatrix);
    
    return new Vec4((float) rot.get(0),(float) rot.get(1),(float) rot.get(2),(float) rot.get(3));
  }
  
  void move(String axis) {
    this.move(axis, CAMERA_SPEED);
  }
  
  void move(String axis, float step) {
    switch(axis) {
      case "x":
        position = position.add(rotateVector(rotation.mul(step), 0, 0, 0, 0, (float) Math.PI/2, 0)); break;
      case "-x":
        position = position.add(rotateVector(rotation.mul(step), 0, 0, 0, 0, (float)-Math.PI/2, 0)); break;
      case "y":
        position = position.add(rotateVector(rotation.mul(step), 0, 0, 0, (float) Math.PI/2, 0, 0)); break;
      case "-y":
        position = position.add(rotateVector(rotation.mul(step), 0, 0, 0, (float)-Math.PI/2, 0, 0)); break;
      case "z":
        position = position.add(rotation.mul(step)); break; // Forward and backward don't need rotation
      case "-z":
        position = position.add(rotation.mul(-step)); break;
      case "w":
        position.w += step; break;  // Absolute movement (not related to orientation) in 4th dimension.
                                    // Anything else is way too difficult to control.
      case "-w":
        position.w -= step; break;
    }
  }
  
  Vec4 getPosition() {
    return this.position;
  }
  
  Vec4 getRotation() {
    return this.rotation;
  }
}
