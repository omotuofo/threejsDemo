import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import Stats from './libs/stats.module.js';
import { GUI } from './libs/lil-gui.module.min.js';
import { EffectComposer } from './libs/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './libs/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from './libs/jsm/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from './libs/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './libs/jsm/postprocessing/OutputPass.js';
import { GlitchPass } from './libs/jsm/postprocessing/GlitchPass.js';
import { GammaCorrectionShader } from './libs/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from './libs/jsm/postprocessing/ShaderPass.js';

var scene = new THREE.Scene();

// 实例化一个gui对象
const gui = new GUI();
// 创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
const obj = {
    x: 30,
    y: 60,
    z: 300,
    color: '#00ffff',
};
// gui界面上增加交互界面，改变obj对应属性
// gui.add(obj, 'x', 0, 100);
// gui.add(obj, 'y', 0, 50);
// gui.add(obj, 'z', 0, 60);


const geometry = new THREE.BoxGeometry(100, 100, 100);
// 漫反射材质对象Material
// const material = new THREE.MeshLambertMaterial({
//     // color: 0x00ffff, //设置材质颜色
//     // transparent: false,//开启透明
//     // opacity: 0.5,//设置透明度
// });

//纹理贴图加载器TextureLoader
const texLoader = new THREE.TextureLoader();
// .load()方法加载图像，返回一个纹理对象Texture
const texture = texLoader.load('./images/material.jpg');

// 模拟镜面反射，产生一个高光效果
// const material = new THREE.MeshPhongMaterial({
//     color: 0x00ffff,
//     shininess: 20, //高光部分的亮度，默认30
//     specular: 0x444444, //高光部分的颜色
// });

// 贴图
const material = new THREE.MeshLambertMaterial({
    // 设置纹理贴图：Texture对象作为材质map属性的属性值
    map: texture,//map表示材质的颜色贴图属性
});
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        // 在XOZ平面上分布
        mesh.position.set(i * 200, 0, j * 200);
        scene.add(mesh); //网格模型添加到场景中  
    }
}

// CircleGeometry：圆形平面
const geometryCircle = new THREE.CircleGeometry(500);
// 材质要两面可见（如果是单面体）
const circleMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide, //两面可见
    color: 0x00ffff, //设置材质颜色
    transparent: true,//开启透明
    opacity: 0.5,//设置透明度
});
const circleMesh = new THREE.Mesh(geometryCircle, circleMaterial);
circleMesh.position.set(900, 200, 900);
circleMesh.rotateX(Math.PI/2);
scene.add(circleMesh);

// 相机
const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
const aspect = width/height;
// fov视场变化，会导致获取到的画面大小变化；导致在浏览器的画布中，有远近变化的感觉。
// fov变大，看到的画面内容变大，浏览器展现内容变多，原先的物体就会变小，然后感觉远了。如果是VR场景中，物体大小应该是不会变的，只是上下左右的边界变宽了。
const camera = new THREE.PerspectiveCamera(90, aspect, 1, 5000);
// camera.position.set(2000, 2000, 2000); 
camera.position.set(2000, 2000, 1000); 
// camera.lookAt(2000, 2000, 2000);  // 没作用


// 光源
const pointLight = new THREE.PointLight('red', 1000.0);
pointLight.decay = 0.9;// 光源不随距离衰减:0.0，默认是2.0。数字越大，衰减效果越明显
pointLight.position.set(200, 200, 200);//点光源放在x轴上
scene.add(pointLight); //点光源添加到场景中
const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
scene.add(pointLightHelper);

// gui
// 有回调吗？
// 有，在onChange中
gui.add(pointLight.position, 'x', 0, 2000);
gui.add(pointLight.position, 'y', 0, 2000);
gui.add(pointLight.position, 'z', 0, 2000);
gui.addColor(pointLight, 'color').name('颜色').onChange(e => {
    // pointLight.color = e;
});
gui.add(pointLight, 'intensity', 0, 2000).name('点光源强度').onChange(function(value){
    // pointLight.intensity = value;
    // renderer.render(scene, camera);
});



document.addEventListener('keydown', function(event) {
    // 87：w；a：65；83：s；68：d；
    if (event.keyCode == 87) {
        pointLight.position.x -= 20;
    } else if (event.keyCode == 83) {
        pointLight.position.x += 20;
    } else if (event.keyCode == 68) {
        pointLight.position.z -= 20;
    } else if (event.keyCode == 65) {
        pointLight.position.z += 20;
    } else if (event.keyCode == 38) {
        pointLight.position.y += 20;
    } else if (event.keyCode == 40) {
        pointLight.position.y -= 20;
    }
    // console.log('按下键盘键码:', event.keyCode);
});


//环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambient);


// 创建渲染器对象
const renderer = new THREE.WebGLRenderer();
// 锯齿
renderer.antialias = false;

// 不同硬件设备的屏幕的设备像素比window.devicePixelRatio值可能不同
console.log('查看当前屏幕设备像素比',window.devicePixelRatio);
// 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
renderer.setPixelRatio(window.devicePixelRatio);


renderer.setClearColor(0x444444, 1); //设置背景颜色


renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
renderer.render(scene, camera); //执行渲染操作
document.body.appendChild(renderer.domElement);

// 创建后处理对象EffectComposer，WebGL渲染器作为参数
const composer = new EffectComposer(renderer);
// 创建一个渲染器通道，场景和相机作为参数
const renderPass = new RenderPass(scene, camera);
// 设置renderPass通道
composer.addPass(renderPass);
// OutlinePass第一个参数v2的尺寸和canvas画布保持一致
const v2 = new THREE.Vector2(width, height);
// const v2 = new THREE.Vector2(800, 600);
const outlinePass = new OutlinePass(v2, scene, camera);
// 一个模型对象
outlinePass.selectedObjects = [circleMesh];
// outlinePass.selectedObjects = scene.children;
// 设置OutlinePass通道
composer.addPass(outlinePass);

outlinePass.edgeThickness = 1.0;
outlinePass.edgeStrength = 20; 
outlinePass.pulsePeriod = 5;
// outlinePass.visibleEdgeColor = '0xa600ff'; // 直接设置值不行
outlinePass.visibleEdgeColor.set(0xa600ff);



const lineFolder = gui.addFolder('描边渲染');
lineFolder.add(outlinePass, 'edgeThickness', 1, 20);
lineFolder.add(outlinePass, 'edgeStrength', 1, 20);
lineFolder.add(outlinePass, 'pulsePeriod', 1, 10);
lineFolder.addColor(outlinePass, 'visibleEdgeColor');


const bloomPass = new UnrealBloomPass(v2, 0.5, 0.4, 1);
composer.addPass(bloomPass);
bloomPass.selectedObjects = [circleMesh];
const bloomFolder = gui.addFolder('发光渲染');
bloomFolder.add(bloomPass, 'threshold', 0, 1).name('起点');
bloomFolder.add(bloomPass, 'strength', 0, 3).name('光照强度');
bloomFolder.add(bloomPass, 'radius', 0, 1);

const outputPass = new OutputPass();
// composer.addPass(outputPass);

// 频闪
const glitchPass = new GlitchPass();
// 设置glitchPass通道
// composer.addPass(glitchPass);

// 创建伽马校正通道
const gammaPass= new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaPass);



// 相机控制
// 相机的目标，也就是target应该是不变的（相机始终朝向目标），鼠标移动或者缩放，改变的是相机的位置
// 左键移动，代表相机绕着target旋转；右键移动，代表相机在切面上平移（相机和target的切面）
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', function () {
    // camera.rotation.x = 0;
    // camera.rotation.y = 0;
    // camera.rotation.z = Math.PI*2;
    // renderer.render(scene, camera); //执行渲染操作
});//监听鼠标、键盘事件

//创建stats对象（左上角性能监视器）
const stats = new Stats();
document.body.appendChild(stats.domElement);

// 坐标系
const axesHelper = new THREE.AxesHelper(1500, 1500, 1500);
scene.add(axesHelper);


// 相机控件.target属性在OrbitControls.js内部表示相机目标观察点，默认0,0,0
controls.target.set(1000, 0, 1000);
controls.update();

// 渲染循环
function render() {
    renderer.render(scene, camera);
    composer.render();
    stats.update();

    requestAnimationFrame(render);
}
render();





