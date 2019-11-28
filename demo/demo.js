"use strict";


function main() {
    //Get A WebGL context
    let primitives = twgl.primitives;
    let m4 = twgl.m4;

    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        return;
    }

    //cube bufferInfo
    // let vertices = primitives.createPlaneVertices(200,200,2,2);
    let vertices = createDeskVertices();
    let bufferInfo = twgl.createBufferInfoFromArrays(gl,vertices);
    let colorArray = primitives.makeRandomVertexColors(vertices);
    let colorBufferInfo = twgl.createBufferInfoFromArrays(gl,colorArray);

    // setup GLSL program
    var programInfo = twgl.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);;

    //some useful tool functions
    function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    function randInt(range) {
        return Math.floor(Math.random() * range);
    }
    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    }

    //radians of view
    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(75);

    //uniforms that are the same for all objects
    var uniformsGlobal = {
        u_matrix:  m4.identity(),
    };

    //uniforms that are computed for each object
    //...

    drawScene();

    // Draw the scene.
    function drawScene() {
        twgl.resizeCanvasToDisplaySize(gl.canvas);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(programInfo.program);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        var radius = 200;
        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);


        // Compute a matrix for the camera
        var cameraMatrix = m4.rotationY(cameraAngleRadians);
        cameraMatrix = m4.translate(cameraMatrix, [0, 0, radius * 2.5]);
        // Make a view matrix from the camera matrix
        var viewMatrix = m4.inverse(cameraMatrix);

        // Compute a view projection matrix
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        //uniform global
        uniformsGlobal.u_matrix = viewProjectionMatrix;

        //set uniform
        twgl.setUniforms(programInfo,uniformsGlobal);
        //set buffer
        twgl.setBuffersAndAttributes(gl,programInfo,bufferInfo);
        twgl.setBuffersAndAttributes(gl,programInfo,colorBufferInfo);


        // Draw the geometry.
        // gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
        twgl.drawBufferInfo(gl,bufferInfo);
        requestAnimationFrame(()=>{
            cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians)+1);
            drawScene();
        })
    }

    //桌子
    /**
     * @return array
     */
    function createDeskVertices() {
        let verticesArray = [];
        //八个顶点
        verticesArray = primitives.createCubeVertices(200);
        return verticesArray;
    }
}

window.onload=function () {
    main();
};

