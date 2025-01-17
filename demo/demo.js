"use strict";
const m4 = twgl.m4;
const v3 = twgl.v3;
const textures = twgl.texture;
const primitives = twgl.primitives;
const gl = document.querySelector("#c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
let prevTitle = this.document.title;

/**
 * 显示网页title的函数，当页面被挡住或者切换title改为“最终产品”，并停止运行程序
 * 切换回该网页之后正常显示原来的title
 */
window.onblur = function () {
    prevTitle = this.document.title;
    this.document.title = "最终产品";
};
window.onfocus = function () {
    this.document.title = prevTitle;
};

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}
//光照
var lightPosition = [1, 8, 10];

var rotation1 = Math.PI / 3;
var translation1 = 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3);
var rotation2 = Math.PI * 2 / 3;
var translation2 = 1.05 + 0.5 * 0.375 * 0.5 * Math.sin(Math.PI / 3);
//var rotation = degToRad(0);
var then = 0;
var flag = 0;
var rotationSpeed = 0.25;
var time = 0.0;//全局计时器
var tid;//计时器编号

//设置旋转速度
function timer() {
    time += 0.002;
}
//开始旋转
function start() {
    tid = setInterval(timer, 1);
}
//光源向左移动
document.getElementById("lightLeft").onclick = function () {
    lightPosition[0] -= 0.5;
    var temp = m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]);
    var lb = objects.find(v => v === lightBulb);
    lb.localMatrix = temp;
};
//光源向右移动
document.getElementById("lightRight").onclick = function () {
    lightPosition[0] += 0.5;
    var temp = m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]);
    var lb = objects.find(v => v === lightBulb);
    lb.localMatrix = temp;
};

//停止旋转按钮
document.getElementById("stop").onclick = function () {
    clearInterval(tid);
    document.getElementById("start").disabled = false;
    document.getElementById("start").disabled=false;
};
//开始旋转按钮
document.getElementById("start").onclick = function () {
    start();
    document.getElementById("start").disabled = true;
    document.getElementById("start").disabled=true;
};
//折叠屏幕按钮
document.getElementById("fold").onclick = function () {
    flag = 1;
};

//回复按钮
document.getElementById("recover").onclick = function () {
    flag = -1;
};

/**
 * 更新surface状态的函数，在折叠和恢复过程中使用
 */
function renewSurface() {
    var temp = m4.multiply(m4.multiply(m4.translation([0, translation1, 0]), m4.rotationX(rotation1)), m4.scaling([1, 0.05, 0.75]))
    var sb = objects.find(v => v === surfaceBody);
    sb.localMatrix = temp;

    var temp1 = m4.multiply(m4.multiply(m4.translation([0, translation2, -0.0625]), m4.rotationX(rotation2)), m4.scaling([1, 0.05, 0.375]));
    var ss = objects.find(v => v === surfaceSupport);
    ss.localMatrix = temp1;


}

//主要的绘制函数
function render(now) {
    //time *= 0.001;
    now *= 0.001;
    // 减去上一次的时间得到时间差
    var deltaTime = now - then;
    // 记住这次时间
    then = now;

    //rotation += rotationSpeed * deltaTime;
    if(flag === 1)//折叠
    {
        if (rotation1 <= 0)
            rotation1 = 0;
        else
            rotation1 -= rotationSpeed * deltaTime;

        if(rotation2 <= 0)
            rotation2 = 0;
        else
            rotation2 -= rotationSpeed *2 * deltaTime;

        if (translation1 <= 1.07)
            translation1 = 1.07;
        else
            translation1 -= 0.00075;

        if (translation2 <= 1.0)
            translation2 = 1.0;
        else
            translation2 -= 0.00075;
    }
    else if(flag === -1)//还原
    {
        if (rotation1 >= Math.PI/3)
            rotation1 = Math.PI/3;
        else
            rotation1 += rotationSpeed * deltaTime;

        if(rotation2 >= Math.PI*2/3)
            rotation2 = Math.PI*2/3;
        else
            rotation2 += rotationSpeed *2 * deltaTime;

        if (translation1 >= 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3))
            translation1 = 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3);
        else
            translation1 += 0.00075;

        if (translation2 >= 1.05 + 0.5 * 0.375 * 0.5 * Math.sin(Math.PI / 3))
            translation2 = 1.05 + 0.5 * 0.375 * 0.5 * Math.sin(Math.PI / 3);
        else
            translation2 += 0.00075;
    }


    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//开启深度测
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //透视投影
    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 1000;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    //照相机
    const eye = [2, 4, 6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    //视图投影矩阵
    const viewProjection = m4.multiply(projection, view);
    //世界矩阵
    const world = m4.rotationY(time);

    //设置uniform矩阵
    uniforms.u_projection = viewProjection;
    uniforms.u_world = world;
    uniforms.u_viewInverse = camera;

    //光源位置更新
    uniforms.u_lightWorldPos = m4.transformPoint(world, lightPosition);
    //桌面位置更新
    renewSurface();

    gl.useProgram(programInfo.program);

    /**
     * 对物体列表中的每个物体执行相同动作；
     * 每个物体的绘制只需要知道programInfo，bufferInfo和uniform
     * 在其中指定每个物体对应的uniform值，bufferInfo；
     * 一次即可成功绘制所有物体
     */
    objects.forEach(function (obj) {
        twgl.setBuffersAndAttributes(gl, programInfo, obj.bufferInfo);
        //每个物体的矩阵
        uniforms.u_localMatrix = obj.localMatrix;
        uniforms.u_color = obj.color;
        //逆转置矩阵，光照用
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(m4.multiply(world, obj.localMatrix)));
        //纹理
        uniforms.u_texture = obj.diffuse;
        //检查高光
        uniforms.u_specularFactor = obj.specularFactor ? obj.specularFactor : 0.1;
        uniforms.u_shininess = obj.shininess ? obj.shininess : 100;
        //提交uniforms变量
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, obj.bufferInfo);
    });

    requestAnimationFrame(render);
}
requestAnimationFrame(render);


/**# 纹理对象
 * 纹理和颜色相乘，如果只想设置纹理，则颜色给纯白色;
 * 如果只想设置颜色，则使用纯白色纹理**white**，颜色正常给
 */
let textureList = twgl.createTextures(gl, {
    checker: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: [
            255, 255, 255, 255,
            192, 192, 192, 255,
            192, 192, 192, 255,
            255, 255, 255, 255,
        ],
    },
    // a 1x8 pixel texture from a typed array.
    stripe: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format: gl.LUMINANCE,
        src: new Uint8Array([
            255,
            128,
            255,
            128,
            255,
            128,
            255,
            128,
        ]),
        width: 1,
    },

    microsoft: { src: images.microsoft_logo, },

    surface_image: { src: images.surface_image, },

    chair_texture: { src: images.chair_texture },

    keyboad_texture: { src: images.keyboard },


    deskleg_texture: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format: gl.LUMINANCE,
        src: new Uint8Array([
            200,
            200,
            200,
            200,
        ]),
        width: 1,
    },
    red:
    {
        src: new Uint8Array([255, 0, 0, 255])
    },
    green: {
        src: new Uint8Array([0, 255, 0, 255])
    },
    blue: {
        src: new Uint8Array([0, 0, 255, 255])
    },

    yin: {
        src: new Uint8Array([192, 192, 192, 255])
    },
    white: {
        src: new Uint8Array([255, 255, 255, 255])
    }
});



//全局变量
const uniforms = {
    u_projection: m4.identity(),
    u_world: m4.identity(),
    u_localMatrix: m4.identity(),
    u_color: [0, 0, 0, 1],
    u_worldInverseTranspose: m4.identity(),

    //纹理
    u_lightWorldPos: lightPosition,     //光源位置
    u_lightColor: [1, 1, 1, 1],         //光源颜色
    u_ambient: [0.4, 0.4, 0.4, 1],      //环境光
    u_specular: [1, 1, 1, 1],           //镜面光颜色
    u_shininess: 100,                   //光照系数
    u_specularFactor: 0,                //镜面光系数
    u_texture: textureList.check,       //纹理
};




//地面
let ground = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createXYQuadVertices(7), m4.rotationX(Math.PI / 2)),
    localMatrix: m4.rotationX(Math.PI / 2 * 3),
    color: [...v3.normalize([1, 1, 1]), 1],
    diffuse: textureList.checker,
    specularFactor: 0,
};

//坐标系
let coordinate_x = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.01, 0.3, 100, 100),
    localMatrix: m4.multiply(m4.translation([0.15, 0, 0]), m4.rotationZ(Math.PI / 2)),
    color: [1, 0, 0, 1],
    diffuse: textureList.red,
};
let coordinate_y = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.01, 0.3, 100, 100),
    localMatrix: m4.translation([0, 0.15, 0]),
    color: [0, 1, 0, 1],
    diffuse: textureList.green,
};
let coordinate_z = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.01, 0.3, 100, 100),
    localMatrix: m4.multiply(m4.translation([0, 0, 0.15]), m4.rotationX(Math.PI / 2)),
    color: [0, 0, 1, 1],
    diffuse: textureList.blue
};


//光源模拟球
let lightBulb = {
    bufferInfo: primitives.createSphereBufferInfo(gl, 0.05, 100, 100),
    localMatrix: m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]),
    color: [1, 0, 0, 1],
    diffuse: textureList.white,
};

//F
let F = {
    bufferInfo: primitives.create3DFBufferInfo(gl),
    localMatrix: m4.identity(),
    color: [0, 0, 1, 1],
    diffuse: textureList.checker,
};

//桌子
//桌面
let cube = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(1)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1, 0]), m4.rotationY(0)), m4.scaling([2, 0.1, 1])),
    color: [1.0, 0.96, 0.30, 1.0],
    diffuse: textureList.stripe,
    specularFactor: 0.5,
    shininess: 30,
};
//桌腿
let deskLeg1 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([0.5, 0.95 / 2, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskLeg2 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([-0.5, 0.95 / 2, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskLeg3 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([0.5, 0.95 / 2, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskLeg4 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([-0.5, 0.95 / 2, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
//桌脚
let disc1 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([0.5, 0.001, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let disc2 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([0.5, 0.001, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let disc3 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([-0.5, 0.001, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,

};
let disc4 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([-0.5, 0.001, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};

//椅子
//椅子坐
let chairDown = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix: m4.multiply(m4.translation([0, 0.5, 1]), m4.scaling([1, 0.1, 1])),
    color: [0.96, 0.64, 0.66, 1.0],
    diffuse: textureList.chair_texture,
};
//椅子背
let chairBack = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 0.835, 1.375]), m4.rotationX(Math.PI / 2)), m4.scaling([1, 0.1, 1])),
    color: [0.96, 0.64, 0.66, 1.0],
    diffuse: textureList.chair_texture,
};
//椅子腿
let chairLeg1 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([0.75 / 4, 0.4625 / 2, 1 + 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};
let chairLeg2 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([-0.75 / 4, 0.4625 / 2, 1 + 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};

let chairLeg3 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([0.75 / 4, 0.4625 / 2, 1 - 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};

let chairLeg4 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([-0.75 / 4, 0.4625 / 2, 1 - 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};
//电脑
//电脑体
let surfaceBody = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3), 0]), m4.rotationX(rotation1)), m4.scaling([1, 0.05, 0.75])),
    color: [0.9, 0.9, 0.9, 1.0],
    diffuse: textureList.surface_image,
    specularFactor: 1,
};
//电脑屏幕，暂时用不到
// let surfacebody_screen = {
//     bufferInfo: primitives.createXYQuadBufferInfo(gl, 0.5),
//     localMatrix: m4.multiply(m4.multiply(m4.translation([0.015, 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3), 0.015]), m4.rotationX(-Math.PI / 6)), m4.scaling([1, 0.75, 1])),
//     color: [0.75, 0.75, 0.75, 1.0],

//     specularFactor: 1,
// };
//电脑支架
let surfaceSupport = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1.05 + 0.5 * 0.375 * 0.5 * Math.sin(Math.PI / 3), -0.0625]), m4.rotationX(rotation2)), m4.scaling([1, 0.05, 0.375])),
    color: [0.75, 0.75, 0.75, 1.0],
    diffuse: textureList.microsoft,
};
//电脑键盘
let surfaceKeyboard = {
    bufferInfo: primitives.createCubeBufferInfo(gl, 0.5),
    localMatrix: m4.multiply(m4.translation([0, 1.06, 0.3]), m4.scaling([1, 0.01, 0.8])),
    color: [1, 1, 1, 1],
    diffuse: textureList.keyboad_texture,
};

//自定义立方体
// let newCube = {
//     bufferInfo:twgl.createBufferInfoFromArrays(gl, primitives.createCubeverticesNew(0.3)),
//     localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1, 0]), m4.rotationY(rotation[1])), m4.scaling([2, 0.1, 1])),
//     color: [1.0, 0.96, 0.30, 1.0],
//     diffuse: textureList.stripe,
//     specularFactor: 0.5,
//     shininess: 30,
// }


//物体列表
let objects = [cube, ground, coordinate_x, coordinate_y, coordinate_z,
    deskLeg1, deskLeg2, deskLeg3, deskLeg4, disc1, disc2, disc3, disc4
   , chairDown, chairBack, chairLeg1, chairLeg2, chairLeg3, chairLeg4,
    surfaceBody, surfaceSupport, lightBulb, surfaceKeyboard,
];
