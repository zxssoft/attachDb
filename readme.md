# attachDbRun.exe 附加用户数据库命令
    用友的数据库路径和数据库名规则
  文件路径 	                       			 
  		D:\U8SOFT\ADMIN\ZT006\2022\UFDATA.MDF,D:\U8SOFT\ADMIN\ZT006\2022\UFDATA.LDF  
    数据库名
		称根据以上路径生成 UFDATA_006_2022

# 命令使用方式
	attachDbRun.exe 支持附加sql2000 或 2000以上的版本
	命令参数
			-d: 附加数据库的路径
			-i: 服务器的实例名  例如 连接数据库的服务名是 server\sql2008 实例就是sql2008
			-u: 用户名 (如果使用windows身份验证不需要 -u -p 参数)
			-p: 密码
			
				附加sql2000数据库命令:
					windows 身份验证
					.\attachDbRun.exe -d D:\U8SOFT -i sql2008
					sql server身份验证
					.\attachDbRun.exe -d D:\U8SOFT -i sql2008 -u sa -p *****
	
				附加sql2008数据库命令:
					windows 身份验证
					.\attachDbRun.exe 2008 -d D:\U8SOFT -i sql2008
					sql server身份验证
					.\attachDbRun.exe 2008 -d D:\U8SOFT -i sql2008 -u sa -p *****