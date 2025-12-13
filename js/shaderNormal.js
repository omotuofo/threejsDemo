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
const aspect = width / height;
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

const texLoader = new THREE.TextureLoader();



/** -------------------------------------径向渐变球球体开始-------------------------------------------------------- */
// SphereGeometry参数说明:
// new THREE.SphereGeometry(
//   radius,        // 半径
//   widthSegments, // 宽度分段数（经度方向）
//   heightSegments, // 高度分段数（纬度方向） 
//   phiStart,      // 水平起始角度
//   phiLength,     // 水平扫描角度
//   thetaStart,    // 垂直起始角度
//   thetaLength    // 垂直扫描角度
// )
const sphere = new THREE.SphereGeometry(50, 300, 300, 0, 2 * Math.PI, 0, Math.PI / 2);
const normalMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff, //设置材质颜色
    transparent: !0,
    opacity: 1,
    side: THREE.DoubleSide
});
// const mesh = new THREE.Mesh(sphere, normalMaterial);
const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_color: {
            value: new THREE.Vector3(0, 1, 1)
        },
        u_pow: { value: 1.2 }
    },
    // 把换行去掉
    vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        // 法线从模型空间变换到视图空间(相机为原点的坐标系)，并归一化
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
    fragmentShader: `
                    varying vec3 vNormal;
                    uniform vec3 u_color;
                    uniform float u_pow;
                    void main() {
                        // 正对屏幕方向
                        vec3 z = vec3(0.0, 0.0, 1.0);
                        // 内积的绝对值，计算法线与屏幕正对方向的夹角
                        // dot计算两个向量的点积
                        // 1.0表示完全重合，0.0表示垂直，-1.0表示相反方向
                        float x = abs(dot(vNormal, z));
                        // 根据夹角值计算透明度
                        float alpha = pow(1.0 - x, u_pow);
                        // 效果：法线正对屏幕时完全透明，法线垂直屏幕时不透明
                        gl_FragColor = vec4(u_color, alpha);
                    }
                `,
    transparent: !0
});
const mesh = new THREE.Mesh(sphere, shaderMaterial);
scene.add(mesh);


// gui
const sphereFolder = gui.addFolder('球体参数设置');
sphereFolder.open();

// geometry的属性，不支持动态修改，只能重新生成几何体
sphereFolder.add(sphere.parameters, 'radius', 50, 300).name('半径').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'widthSegments', 3, 5000).step(1).name('宽度分段数').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'heightSegments', 2, 5000).step(1).name('高度分段数').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'phiStart', 0, Math.PI * 2).name('水平起始角度').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'phiLength', 0, Math.PI * 2).name('水平扫描角度').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'thetaStart', 0, Math.PI).name('垂直起始角度').onChange(e => {
    updateGeometry();
});
sphereFolder.add(sphere.parameters, 'thetaLength', 0, Math.PI).name('垂直扫描角度').onChange(e => {
    updateGeometry();
});
sphereFolder.addColor(shaderMaterial.uniforms.u_color, 'value').name('颜色').onChange(e => {
    shaderMaterial.uniforms.u_color.value.x = e.r;
    shaderMaterial.uniforms.u_color.value.y = e.g;
    shaderMaterial.uniforms.u_color.value.z = e.b;
});
sphereFolder.add(shaderMaterial.uniforms.u_pow, 'value', 0.1, 5.0).name('透明度变化');


function updateGeometry() {
    sphere.dispose();   // 释放旧的几何体
    const newSphere = new THREE.SphereGeometry(sphere.parameters.radius, sphere.parameters.widthSegments, sphere.parameters.heightSegments, sphere.parameters.phiStart, sphere.parameters.phiLength, sphere.parameters.thetaStart, sphere.parameters.thetaLength);
    mesh.geometry = newSphere;
}


/** -------------------------------------径向渐变球球体结束-------------------------------------------------------- */



/** -------------------------------------雷达开始----------------------------------------------------------------- */
let radarGroup = new THREE.Group();
scene.add(radarGroup);
const radarGeometry = new THREE.PlaneGeometry(100, 100);
const radarTextureI = texLoader.load('./images/radar_inside.png');
const radarTextureO = texLoader.load('./images/radar_outside.png');
const radarMaterialI = new THREE.MeshLambertMaterial({
    color: '#ff0000',
    map: radarTextureI,
    side: THREE.DoubleSide,
    transparent: !0,
    depthTest: !1
});
const radarMaterialO = new THREE.MeshLambertMaterial({
    color: '#990000',
    map: radarTextureO,
    side: THREE.DoubleSide,
    transparent: !0,
    depthTest: !1
});
const radarMeshI = new THREE.Mesh(radarGeometry, radarMaterialI);
const radarMeshO = new THREE.Mesh(radarGeometry, radarMaterialO);
radarGroup.add(radarMeshI);
radarGroup.add(radarMeshO);
radarGroup.rotateX(-Math.PI / 2);
radarGroup.position.set(250, 0, 0);

const radarFolder = gui.addFolder('雷达参数设置');
radarFolder.open();
radarFolder.add(radarGroup.position, 'x', -2000, 2000).name('雷达X位置');
radarFolder.add(radarGroup.position, 'y', 0, 2000).name('雷达Y位置');
radarFolder.add(radarGroup.position, 'z', -2000, 2000).name('雷达Z位置');
radarFolder.addColor(radarMaterialI, 'color').name('内圈颜色');
radarFolder.addColor(radarMaterialO, 'color').name('外圈颜色');
radarFolder.add(radarGeometry.parameters, 'width', 50, 500).name('半径').onChange(e => {
    radarGeometry.dispose();   // 释放旧的几何体
    const newradarGeometry = new THREE.PlaneGeometry(e, e);
    radarMeshI.geometry = newradarGeometry;
    radarMeshO.geometry = newradarGeometry;
});

/** -------------------------------------雷达结束----------------------------------------------------------------- */


/** -------------------------------------光墙开始----------------------------------------------------------------- */
/** -------------------------------------光墙结束----------------------------------------------------------------- */

// 渲染循环
function render() {
    renderer.render(scene, camera);
    radarMeshI.rotateZ(0.02);
    requestAnimationFrame(render);
}
render();