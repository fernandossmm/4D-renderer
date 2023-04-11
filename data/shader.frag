// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

// #define vec5 float[5]

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
// uniform float[] object;
uniform vec4 camera_position;
uniform vec4 camera_rotation;
uniform vec3 camera_angles_one;
uniform vec3 camera_angles_two;

// Utils
float maxcomp4 (in vec4 v) {  // Maximum of the components
  return max (max (v.x, v.y), max (v.z, v.w));
}

vec4 rotate(vec4 v, float zwRot, float ywRot, float xwRot, float yzRot, float xzRot, float xyRot) {
  
  mat4 zw = mat4( vec4(      1.0,      0.0,      0.0,      0.0),
                  vec4(      0.0,      1.0,      0.0,      0.0),
                  vec4(      0.0,      0.0, cos(zwRot),-sin(zwRot)),
                  vec4(      0.0,      0.0, sin(zwRot), cos(zwRot)) );
  
  mat4 yw = mat4( vec4(      1.0,      0.0,      0.0,      0.0),
                  vec4(      0.0, cos(ywRot),      0.0,-sin(ywRot)),
                  vec4(      0.0,      0.0,      1.0,      0.0),
                  vec4(      0.0, sin(ywRot),      0.0, cos(ywRot)) );
  
  mat4 xw = mat4( vec4( cos(xwRot),      0.0,      0.0,-sin(xwRot)),
                  vec4(      0.0,      1.0,      0.0,      0.0),
                  vec4(      0.0,      0.0,      1.0,      0.0),
                  vec4( sin(xwRot),      0.0,      0.0, cos(xwRot)) );
  
  mat4 yz = mat4( vec4(      1.0,      0.0,      0.0,      0.0),
                  vec4(      0.0, cos(yzRot),-sin(yzRot),      0.0),
                  vec4(      0.0, sin(yzRot), cos(yzRot),      0.0),
                  vec4(      0.0,      0.0,      0.0,      1.0) );
  
  mat4 xz = mat4( vec4( cos(xzRot),      0.0,-sin(xzRot),      0.0),
                  vec4(      0.0,       1.0,      0.0,      0.0),
                  vec4( sin(xzRot),      0.0, cos(xzRot),      0.0),
                  vec4(      0.0,      0.0,      0.0,      1.0) );
  
  mat4 xy = mat4( vec4( cos(xyRot),-sin(xyRot),      0.0,      0.0),
                  vec4( sin(xyRot), cos(xyRot),      0.0,      0.0),
                  vec4(      0.0,      0.0,      1.0,      0.0),
                  vec4(      0.0,      0.0,      0.0,      1.0) );
  
  return zw*yw*xw*yz*xz*xy*v;
}

// Rotation


// Cube, infinite grid, torus (4 types)

// Enum
const int INTERSECTION = -1;
const int UNION = -2;
const int DIFFERENCE = -3;
const int BALL = 1;
const int PARALLELOTOPE = 2;

/*** Generic geometric object (Shape) ***/
struct Shape
{
  int type;
  vec4 color;
  float r;  // ball radius
  vec4 c;   // center
  vec4 len; // cube lengths
  float[6] rotation;

  bool hidden;
  
  int operand1;
  int operand2;
};

Shape createShape(in int type, in vec4 color, in vec4 center, in float radius, in vec4 len, float[6] rotation, in bool hidden, in int operand1, in int operand2) {
  Shape ret;
  ret.type = type;
  ret.color = color;
  ret.r = radius;  // ball radius
  ret.c = center;  // center
  ret.len = len;  // cube lengths
  ret.rotation = rotation;
  ret.hidden = hidden;
  ret.operand1 = operand1;
  ret.operand2 = operand2;
  return ret;
}

Shape createBall(in vec4 color, in vec4 center, in float radius, in bool hidden) {
  return createShape(BALL, color, center, radius, vec4(0.0), float[6](0.0,0.0,0.0,0.0,0.0,0.0), hidden, 0, 0);
}

Shape createParallelotope(in vec4 color, in vec4 c, in vec4 len, float[6] rotation, in bool hidden) {
  return createShape(PARALLELOTOPE, color, c, 0.0, len, rotation, hidden, 0, 0);
}

Shape createOperation(in int operation, in int operand1, in int operand2, in bool hidden) {
  return createShape(operation, vec4(0.0), vec4(0.0), 0.0, vec4(0.0), float[6](0.0,0.0,0.0,0.0,0.0,0.0), hidden, operand1, operand2);
}

Shape shapes[6];

void loadShapes() {
  shapes[0] = createBall(vec4(1.0,0.0,0.0,0.0), vec4(-1.0,0.0,3.0,0.0), 1.0, true);
  shapes[1] = createBall(vec4(0.0,1.0,0.0,0.0), vec4(-1.0,1.0,3.0,-0.3), 1.0, true);
  shapes[2] = createBall(vec4(0.0,0.0,1.0,0.0), vec4(1.0,-2.0,0.0,-2.2), 2.0, false);
  
  shapes[3] = createBall(vec4(0.1,1.0,0.4,0.0), vec4(0.0,0.0,0.0,0.0), 1.0, false);
  
  shapes[4] = createParallelotope(vec4(1.0,0.0,1.0,0.0), vec4(3.0,0.0,0.0,0.0), vec4(1.0,2.0,1.0,1.0),
                float[](0.0,0.0,0.0,0.0,1.0,0.0), false);
  
  
  shapes[5] = createOperation(DIFFERENCE, 0,1, false);
}

float distanceFromShape(in vec4 position, in int shapeIndex) {
  // Proposal to solve this: While loop and a limited-length stack (maybe 128?) - Really non-performant
  int callStack[32] = int[32](0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
  float returnMap[8] = float[8](0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0);
  int stackIndex = 0;
  int currentShapeIndex = shapeIndex;
  
  callStack[stackIndex] = currentShapeIndex;
  stackIndex++;
  
  while(stackIndex > 0) {
    stackIndex--;
    currentShapeIndex = callStack[stackIndex];
    Shape shape = shapes[currentShapeIndex];

    if(returnMap[currentShapeIndex] == 0.0) {   // if the current shape is not already calculated
    
      switch(shape.type) {
        case BALL:
          returnMap[currentShapeIndex] = length(position - shape.c) - shape.r;
          break;
          
        case PARALLELOTOPE:
          vec4 positionAfterRot = rotate(position - shape.c,
            shape.rotation[0], shape.rotation[1], shape.rotation[2], shape.rotation[3], shape.rotation[4], shape.rotation[5]);
            
          vec4 q = abs(positionAfterRot) - shape.len;
          
          float dist = length(max(q, 0.0));
          
          float m = min(maxcomp4(q),0.0);
          
          returnMap[currentShapeIndex] = length(max(dist,0.0)) + m;
          break;
        
        case INTERSECTION:
            if(returnMap[shape.operand1] == 0.0 && returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = currentShapeIndex;
              stackIndex++;
            }
            if(returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = shape.operand2;
              stackIndex++;
            }
            if(returnMap[shape.operand1] == 0.0) {
              callStack[stackIndex] = shape.operand1;
              stackIndex++;
            }
          
          returnMap[currentShapeIndex] = max(returnMap[shape.operand1], returnMap[shape.operand2]);
          break;

        case UNION:
            if(returnMap[shape.operand1] == 0.0 && returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = currentShapeIndex;
              stackIndex++;
            }
            if(returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = shape.operand2;
              stackIndex++;
            }
            if(returnMap[shape.operand1] == 0.0) {
              callStack[stackIndex] = shape.operand1;
              stackIndex++;
            }
          
          returnMap[currentShapeIndex] = min(returnMap[shape.operand1], returnMap[shape.operand2]);
          break;
          
        case DIFFERENCE:
          if(returnMap[shape.operand1] == 0.0 && returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = currentShapeIndex;
              stackIndex++;
            }
            if(returnMap[shape.operand2] == 0.0) {
              callStack[stackIndex] = shape.operand2;
              stackIndex++;
            }
            if(returnMap[shape.operand1] == 0.0) {
              callStack[stackIndex] = shape.operand1;
              stackIndex++;
            }
          
          returnMap[currentShapeIndex] = max(returnMap[shape.operand1], -returnMap[shape.operand2]);
          break;
      }
    }
  }
  
  return returnMap[currentShapeIndex];
  
}

vec4 closest_color(in vec4 p)
{
  float minDist = 1.0 / 0.0; // Infinity
  float dist = 1.0 / 0.0; // Infinity
  vec4 minColor = vec4(0.0);
  
  for(int i = 0; i<shapes.length(); i++) {
    
    dist = distanceFromShape(p, i);
    
    if(dist < minDist) {
      minDist = dist;
      minColor = shapes[i].color;
    }
  }
  
  return minColor;
}

float map_the_world(in vec4 p)
{
  // float displacement = sin(object[0] * p.x + u_time) * sin(5.0 * p.y + u_time*3) * sin(5.0 * p.z + u_time*7) * 0.25;
  
  float minDist = 1.0 / 0.0; // Infinity
  
  for(int i = 0; i<shapes.length(); i++) {
    if(!shapes[i].hidden)
      minDist = min(minDist, distanceFromShape(p, i));
  }
  
  return minDist;
}

vec4 calculate_normal(in vec4 p)
{
    const vec2 small_step = vec2(0.001, 0.0);
    
    float gradient_x = map_the_world(p + small_step.xyyy) - map_the_world(p - small_step.xyyy);
    float gradient_y = map_the_world(p + small_step.yxyy) - map_the_world(p - small_step.yxyy);
    float gradient_z = map_the_world(p + small_step.yyxy) - map_the_world(p - small_step.yyxy);
    float gradient_w = map_the_world(p + small_step.yyyx) - map_the_world(p - small_step.yyyx);

    vec4 normal = vec4(gradient_x, gradient_y, gradient_z, gradient_w);

    return normalize(normal);
}

vec3 ray_march(in vec4 ro, in vec4 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 64;
    const float MINIMUM_HIT_DISTANCE = 0.01;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec4 current_position = ro + total_distance_traveled * rd;

        float distance_to_closest = map_the_world(current_position);
        
        if (distance_to_closest < MINIMUM_HIT_DISTANCE) // Intersection with something
        {
          vec4 normal = calculate_normal(current_position);

          // For now, hard-code the light's position in our scene
          vec4 light_position = vec4(2.0, -5.0, 3.0, 0.0);

          // Calculate the unit direction vector that points from
          // the point of intersection to the light source
          vec4 direction_to_light = normalize(current_position - light_position);

          float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

          // wildly innefficient, needs refactor
          return closest_color(current_position).xyz * diffuse_intensity;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }
    return vec3((rd.y+1)*0.5*0.2); // Greyscale background to keep track of upwards rotation
}

void main()
{
    float fov = 100.0;
    
    vec2 uv = (gl_FragCoord.xy / u_resolution * 2.0 - 1.0) * vec2(u_resolution.x/u_resolution.y, 1.0) * fov/180.0;
    
    // vec4 ta = camera_rotation;

    vec4 rayOrigin = camera_position;

    vec4 ray = vec4(0.0, 0.0, 1.0, 0.0);
    
    vec4 rayDirection = rotate(ray, 0.0, 0.0, 0.0, uv.y, uv.x, 0.0);
    rayDirection = rotate(rayDirection, camera_angles_one[0], camera_angles_one[1], camera_angles_one[2], camera_angles_two[0], camera_angles_two[1], camera_angles_two[2]);
    
    loadShapes();
    
    if( length(uv) <= 0.009 ) { // Center of the screen
      gl_FragColor = vec4(0.6);
    }
    else {
      vec3 shaded_color = ray_march(rayOrigin, rayDirection);

      gl_FragColor = vec4(shaded_color, 1.0);
    }
}
