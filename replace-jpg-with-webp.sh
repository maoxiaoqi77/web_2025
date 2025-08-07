#!/bin/bash

# 替换所有HTML文件中的jpg/jpeg引用为webp引用，并在替换成功后删除原始的jpg文件
# 作者：Claude
# 日期：2023-08-07

echo "开始替换所有HTML文件中的jpg/jpeg引用为webp引用..."

# 备份所有HTML文件
echo "备份所有HTML文件..."
mkdir -p backups
find . -name "*.html" -exec cp {} backups/ \;

# 获取所有jpg/jpeg文件的路径
jpg_files=$(find images -name "*.jpg" -o -name "*.jpeg")
total_jpg_files=$(echo "$jpg_files" | wc -l)
echo "找到 $total_jpg_files 个jpg/jpeg文件"

# 计数器
replaced_files=0
deleted_files=0
error_files=0
not_referenced_files=0
no_webp_files=0

# 遍历所有jpg/jpeg文件
for jpg_file in $jpg_files; do
    # 构建对应的webp文件路径
    webp_file="${jpg_file%.*}.webp"
    
    # 检查webp文件是否存在
    if [ -f "$webp_file" ]; then
        echo "处理: $jpg_file -> $webp_file"
        
        # 在所有HTML文件中搜索jpg/jpeg文件的引用
        references=$(grep -l "$jpg_file" $(find . -name "*.html" -o -name "*.js"))
        
        # 如果找到引用，则替换为webp
        if [ -n "$references" ]; then
            replacement_success=true
            
            for file in $references; do
                echo "  在 $file 中替换引用..."
                # 替换引用
                sed -i '' "s|$jpg_file|$webp_file|g" "$file"
                
                # 检查替换是否成功
                if grep -q "$webp_file" "$file"; then
                    echo "  替换成功!"
                else
                    echo "  替换失败!"
                    replacement_success=false
                fi
            done
            
            if [ "$replacement_success" = true ]; then
                # 删除原始jpg/jpeg文件
                echo "  删除原始文件: $jpg_file"
                rm "$jpg_file"
                deleted_files=$((deleted_files + 1))
                replaced_files=$((replaced_files + 1))
            else
                error_files=$((error_files + 1))
            fi
        else
            echo "  未找到引用，跳过替换"
            not_referenced_files=$((not_referenced_files + 1))
        fi
    else
        echo "警告: 对应的webp文件不存在: $webp_file，跳过替换"
        no_webp_files=$((no_webp_files + 1))
    fi
done

echo "替换完成!"
echo "统计信息:"
echo "  - 替换成功: $replaced_files 个文件"
echo "  - 删除文件: $deleted_files 个文件"
echo "  - 替换失败: $error_files 个文件"
echo "  - 未引用文件: $not_referenced_files 个文件"
echo "  - 无webp版本: $no_webp_files 个文件"
echo "  - 总jpg/jpeg文件: $total_jpg_files 个文件" 