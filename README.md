<h1 align="center">
  <br>
    4-Dimensional Ray-Marching Renderer
  <br>
</h1>


<div align="center">
  <img height="400" alt="4D Renderer GIF" src="https://github.com/user-attachments/assets/8aa44009-68ad-4146-9367-292294271d29" />
	<p>An experimental 4-D renderer using ray-marching for a mathematically correct tour of 4-D space!</p>
</div>

## About
Ray-marching is a rendering technique similar to ray-tracing. While ray tracing "launches" rays that collide with 3D models, ray marching uses implicit surfaces or signed distance functions (SDFs). SDFs are mathematically-perfect definitions of shapes, instead of approximating them with triangles as is commonly done in 3D rendering.

Both the ray-marching algorithm and SDFs are generalizable to any number of higher dimensions, so this project aims to use them to explore 4D space.

## Features
- Ray marching using 4 dimensional rays and 4 dimensional SDFs
- 4 dimensional camera, with movement along 4 axis (see controls below)
- Supports Hyperspheres, Hypercubes and Parallelotopes
- Shape colors
- Shape rotations
- Object operations (Union, Intersection and Substracion)
- Global 4 dimensional lighting

## Controls
Moving in 4 dimensions is hard!
- You can move the camera Forwards and Backwards using W and S (z-dimension)
- You can move the camera Left and Right using A and D (x-dimensions)
- You can move the camera Up and Down using Up Arrow key and Down Arrow key (y-dimension)
- You can move the camera Ana or Kata using Left Arrow key and Right Arrow key (w-dimension)
- You can rotate the camera Left and Right using J and L
- You can rotate the camera Up ord Down using I and K
- You can reset your view using the Spacebar

## How to install and run
- Make sure to have [Processing](https://processing.org/) installed and updated
- Clone the repository
- Run the sketch using Processing IDE

## Architecture overview
### Processing
Processing is a programming language and coding environment based in Java that aims to make graphic-focused applications easier. In this project, it creates the window, handles user input and does the camera plane's (or, in this case, hyperplane) math. The bulk of the work is done by the OpenGL (GLSL) shader.

### The shader
The shader is currently holding in code the shapes in the space (Spheres, Parallelotopes and operations). These are stored in an array of Shapes, and each Ray checks for distances to these shapes to know how far it can go without collisions. For more information about the ray-marching algorithm, check [here](https://en.wikipedia.org/wiki/Ray_marching).

## Future improvements
- Object blending: makes object that are near each other look fused together and feel "squishy"
- Directional lights and occlusion
- Reflections and 4D mirrors: trippy!
- Implement object cuts instead of projection as a toggleable mode
- Add camera focus
- Antialiasing
- Object glossiness

## Contributions
This project is not actively maintained, but feel free to ask for help or contribute!

## License
Copyright Fernando SSMM, 2025. All rights reserved.








