import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import Stats from './libs/stats.module.js';


var scene = new THREE.Scene();  
console.log(scene);

//创建一个长方体几何对象Geometry
const geometry = new THREE.BoxGeometry(100, 100, 100); 

//创建一个材质对象Material
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,//0xff0000设置材质颜色为红色
    transparent:true,//开启透明
    opacity:0.5,//设置透明度
}); 

// 漫反射材质
const material2 = new THREE.MeshLambertMaterial(); 

// 两个参数分别为几何体geometry、材质material
const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
// mesh.position.set(0,0,0);

// 第二个网格
const mesh2 = new THREE.Mesh(geometry, material2); //网格模型对象Mesh
mesh.position.set(100, 0, 200);

scene.add(mesh); 
scene.add(mesh2); 

// AxesHelper：辅助观察的坐标系
// threeJS的坐标系，红绿蓝代表XYZ，y轴朝上的右手坐标系。
const axesHelper = new THREE.AxesHelper(150);
scene.add(axesHelper);

// 实例化一个透视投影相机对象
// const camera = new THREE.PerspectiveCamera();
//相机在Three.js三维坐标系中的位置
// 根据需要设置相机位置具体值

// width和height用来设置Three.js输出的Canvas画布尺寸(像素px)
const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
// const width = 800; //宽度
// const height = 500; //高度
const aspect = width/height;
// 30:视场角度, width / height:Canvas画布宽高比, 1:近裁截面, 3000：远裁截面
const camera = new THREE.PerspectiveCamera(90, aspect, 1, 5000);

// 正交投影
// const k = width / height; //canvas画布宽高比
// const s = 600;//控制left, right, top, bottom范围大小
// const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
camera.position.set(200, 200, 200); 

// 相机的rotation，初始旋转角度，（0，0，0）时，指向z轴负方向。2PI为一周，数字增加，往逆时针旋转

// camera.lookAt(mesh.position);//指向mesh对应的位置

//点光源：两个参数分别表示光源颜色和光照强度
// 参数1：0xffffff是纯白光,表示光源颜色
// 参数2：1.0,表示光照强度，可以根据需要调整
const pointLight = new THREE.PointLight('red', 10.0);
pointLight.decay = 0.0;// 光源不随距离衰减:0.0，默认是2.0
pointLight.position.set(200, 200, 200);//点光源放在x轴上
scene.add(pointLight); //点光源添加到场景中

// 光源辅助观察
const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
scene.add(pointLightHelper);

//环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 平行光
const directionalLight = new THREE.DirectionalLight('green', 2);
// 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
directionalLight.position.set(-100, -30, -100);
// 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
directionalLight.target = mesh;
scene.add(directionalLight);
// DirectionalLightHelper：可视化平行光
// 参数二：helper的大小
// 参数三：helper的颜色
const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffffff);
scene.add(dirLightHelper);



// 创建渲染器对象
const renderer = new THREE.WebGLRenderer();

// 定义threejs输出画布的尺寸(单位:像素px)
// const width = 800; //宽度
// const height = 500; //高度
renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)

renderer.render(scene, camera); //执行渲染操作
console.log("初始的定位：" + JSON.stringify(camera.position), "旋转：" + JSON.stringify(camera.rotation));

document.body.appendChild(renderer.domElement);






// document.getElementById('webgl').appendChild(renderer.domElement);



// 设置相机控件轨道控制器OrbitControls
// 由于引用了OrbitControls控件，相机的lookAt 被OrbitControls控件更改了。
const controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;
// 如果OrbitControls改变了相机参数，需要重新调用渲染器渲染三维场景（改变了要重新渲染）
// controls.addEventListener('change', function () {
//     renderer.render(scene, camera); //执行渲染操作
//     console.log("定位：" + JSON.stringify(camera.position), "旋转：" + JSON.stringify(camera.rotation));
// });//监听鼠标、键盘事件


//创建stats对象（左上角性能监视器）
const stats = new Stats();
//stats.domElement:web页面上输出计算结果,一个div元素，
document.body.appendChild(stats.domElement);

// window.requestAnimationFrame实现周期性循环执行
// requestAnimationFrame默认每秒钟执行60次，但不一定能做到，要看代码的性能
// 渲染循环
const clock = new THREE.Clock();
function render() {
    const spt = clock.getDelta()*1000;//毫秒
    // console.log('两帧渲染时间间隔(毫秒)',spt);  // 理论16毫秒
    // console.log('帧率FPS',1000/spt);   // 理论60
    // camera.rotateZ(0.01);
    // camera.lookAt(scene.position);
    // 相机旋转
    // camera.rotation.z += 0.01;
    // camera.rotation.x = 0;
    // camera.rotation.y = 0;
    // camera.rotation.z = Math.PI*2;
    
    // 物体旋转
    mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
    console.log("定位：" + JSON.stringify(camera.position), "旋转：" + JSON.stringify(camera.rotation));
    
    
    //requestAnimationFrame循环调用的函数中调用方法update(),来刷新时间
	stats.update();

    renderer.render(scene, camera); //执行渲染操作
    requestAnimationFrame(render);//请求再次执行渲染函数render，渲染下一帧
}
render();


// 随机创建大量的模型,测试渲染性能
const num = 1000; //控制长方体模型数量
for (let i = 0; i < num; i++) {
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshLambertMaterial({
        color: 0x00ffff
    });
    const mesh = new THREE.Mesh(geometry, material);
    // 随机生成长方体xyz坐标
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    mesh.position.set(x, y, z);
    scene.add(mesh); // 模型对象插入场景中
}