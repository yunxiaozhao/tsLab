## WhyFP 4.2中微分算法的一个的简单实现

**配置方法**

本实现使用Docker构建，克隆本仓库后将工作目录改为存放本项目的目录，使用以下代码构建镜像

	docker build -t easydiff .

**使用方法**

构建完成镜像后，使用以下代码运行镜像

	docker run easydiff

接下来使用Docker desktop进入容器的CLI或使用以下代码进入容器的CLI

	 docker exec -it [镜像id] /bin/sh

修改tsLab.ts更改你想要微分的函数以及x和h0的值

	vi tsLab.ts

对tsLab.ts中最后五行进行修改

	//在此定义需要微分的函数
	const foo = (x:number) => 2*x*x +3*x

	//计算微分结果，最后两个数字第一个是计算微分的x的值，第二个是初始的h0
	console.log(within(0.001)((elimerror(order(map(easydiff)(halve)(foo)(5)(4))))))

之后使用以下代码即可计算微分

	ts-node tsLab.ts
