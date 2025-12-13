import * as THREE from 'three';
import { OrbitControls } from '../libs/OrbitControls.js';
import { GUI } from '../libs/lil-gui.module.min.js';
import Stats from '../libs/stats.module.js';



var scene = new THREE.Scene();

// 实例化一个gui对象
const gui = new GUI();

// 相机
const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
const aspect = width/height;
const camera = new THREE.PerspectiveCamera(90, aspect, 1, 5000);
camera.position.set(200, 200, 200);

// 环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambient);

// 创建渲染器对象
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x444444, 1); // 环境背景颜色
renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
renderer.render(scene, camera); //执行渲染操作
document.body.appendChild(renderer.domElement);
renderer.antialias = true; // 抗锯齿(默认false)

const controls = new OrbitControls(camera, renderer.domElement);

// 创建stats对象（左上角性能监视器）
const stats = new Stats();
document.body.appendChild(stats.domElement);

// 坐标系
const axesHelper = new THREE.AxesHelper(1500, 1500, 1500);
scene.add(axesHelper);





// 写在模版字符串中
const vertexShader = `
    // attribute vec3 position; //默认提供,不用自己写,threejs会自动插入这一行
    // uniform mat4 modelMatrix; //默认提供,不用自己写
    // uniform mat4 viewMatrix; //默认提供,不用自己写
    // uniform mat4 projectionMatrix; //默认提供,不用自己写
    // 模型视图矩阵
    // uniform mat4 modelViewMatrix;//默认提供,不用自己写
    attribute vec3 color; //要自己声明一下
    varying vec3 vColor;
    varying vec3 vPosition;//表示顶点插值后位置数据，与片元数量相同，一一对应
    attribute float size;//着色器size变量
    void main(){
        // gl_PointSize = 20.0;
        // gl_PointSize = 20.0 * size;
        vColor = color;// 顶点颜色数据进行插值计算
        vPosition = vec3(modelMatrix * vec4( position, 1.0 ));// 顶点位置坐标插值计算
        // 投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点坐标
        // 注意矩阵乘法前后顺序不要写错
        // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0 );
        // 投影矩阵 * 模型视图矩阵 * 模型顶点坐标（模型视图矩阵=视图矩阵*模型矩阵）
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`
const fragmentShader = `
    uniform float opacity;//uniform声明变量opacity表示透明度
    // uniform vec3 color;//声明一个颜色变量color
    uniform float y; //变化的y控制光带高度
    varying vec3 vColor;
    varying vec3 vPosition;//获取顶点着色器插值数据vPosition
    float w = 10.0;// 移动的光带宽度，一半值
    void main(){
        // 写片元着色器的代码  
        // gl_FragColor = vec4(0.0,1.0,1.0, 0.1);
        // gl_FragColor = vec4(color, opacity);
        // gl_FragColor = vec4(gl_FragCoord.x/800.0*1.0,0.0,0.0,1.0);
        // 根据片元的x坐标，来设置片元的像素值
        // if(gl_FragCoord.y < 300.0){
        //     gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        // } else {
        //     gl_FragColor = vec4(0.0,0.0,1.0,1.0);
        // }

        // gl_FragColor = vec4(vColor,1.0);

        // 根据vPosition位置控制片元颜色
        // if(vPosition.y < 0.0){
        //   gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        // }else{
        //   gl_FragColor = vec4(0.0,0.0,1.0,1.0);
        // }

        float per = (vPosition.y + 25.0)/50.0;
        // 几何体顶点y坐标25，颜色值：1  0  0(红色)
        // 几何体顶点y坐标-25，颜色值：0  1  0(绿色)
        // 渐变色贴图
        gl_FragColor = vec4(per,1.0-per,0.0,1.0);

        // vec2(0.5, 0.5)是方形点的圆心
        // float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        // if(r < 0.5){
        //   // 方形区域片元距离几何中心半径小于0.5，像素颜色设置红色
        //   gl_FragColor = vec4(0.0,1.0,1.0,1.0);
        // }else {
        //   // 方形区域距离几何中心半径不小于0.5的片元剪裁舍弃掉：
        //   discard;
        // }

        if (vPosition.y >= y && vPosition.y < y + w ){
            // gl_FragColor = vec4(1.0,1.0,0.0,1.0);
            float per = (vPosition.y-y)/w;//范围0~1
            per = pow(per,0.5);//平方
            gl_FragColor.rgb = mix( vec3(1.0,1.0,0.0),gl_FragColor.rgb, per);
        }
    }
`
const geometry = new THREE.PlaneGeometry(100, 50);
const material = new THREE.ShaderMaterial({
    // wireframe: true,
    vertexShader: vertexShader,// 顶点着色器
    fragmentShader: fragmentShader,// 片元着色器
    side: THREE.DoubleSide,//双面显示
    transparent: true,//允许透明,透明度要在偏远着色器中设置
    uniforms: {
        // 给透明度uniform变量opacity传值
        opacity: { value: 0.3 },
        // 给uniform同名color变量传值
        color:{value:new THREE.Color(0x00ffff)},
        y: {value: 0}
      },
});
material.onBeforeCompile = function (shader) {
    mesh.shader = shader;
};
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.position.x = 100;
// mesh.position.y = 25;
mesh.position.z = 10;

// 修改渲染器中的值
// material.uniforms.opacity.value = 0.2;
// material.uniforms.color.value.set(0xff0000);

const geometry1 = new THREE.BufferGeometry(); //创建一个几何体对象
//类型数组创建顶点数据
const vertices = new Float32Array([
  // 三角形1顶点坐标
  -50, -25, 0, //顶点1坐标
  50, -25, 0, //顶点2坐标
  50, 25, 0, //顶点3坐标
  // 三角形2顶点坐标
  -50, -25, 0, //顶点4坐标   和顶点1位置相同
  50, 25, 0, //顶点5坐标  和顶点3位置相同
  -50, 25, 0, //顶点6坐标
]);
const attribute = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
// 设置几何体顶点位置.attributes.position
geometry1.attributes.position = attribute;

// const geometryPoint = new THREE.BufferGeometry();
// const verticesPoint = new Float32Array([
//     0, 0, 0, //顶点1坐标
//     25, 0, 0, //顶点2坐标
//     50, 0, 0, //顶点3坐标
//     75, 0, 0, //顶点4坐标
//     100, 0, 0, //顶点5坐标
// ]);
// geometryPoint.attributes.position = new THREE.BufferAttribute(verticesPoint, 3);
// const points = new THREE.Points(geometryPoint, material); //点模型对象
// scene.add(points);


// const sizes = new Float32Array([
//     1.0, //顶点1对应方形点尺寸缩放倍数
//     0.8, //顶点2
//     0.6, //顶点3
//     0.4, //顶点4
//     0.2, //顶点5
// ]);
// geometryPoint.attributes.size = new THREE.BufferAttribute(sizes, 1);


// 渲染循环
const clock = new THREE.Clock();
let yClock = 0;
// 渲染循环
function render() {
    const deltaTime = clock.getDelta();
    renderer.render(scene, camera);
    stats.update();
    yClock += 30 * deltaTime;
    if (yClock >= 50) yClock = -25;
    if (mesh.shader) mesh.shader.uniforms.y.value = yClock;
    // console.log(deltaTime);
    requestAnimationFrame(render);
}
render();