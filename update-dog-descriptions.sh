#!/bin/bash

# 新的描述文本
NEW_DESCRIPTION="I'M JUST A DOG は、トーキョーワンダーサイトのアーティスト・イン・レジデンスとして滞在したベルリンのKunstraum Kreuzberg Bethanienにて制作された、サウンドインスタレーション作品です。
本作では、ベルリンの街で出会った人々に「日常の出来事を話してください」とインタビューを行い、その答えを「犬の鳴き声で表現してください」と依頼しました。意味を持たないように見えるこの行為は、言語という枠組みの外に出ることで、私たちが当然と信じているコミュニケーションの機能や、意味の成立そのものに疑問を投げかけます。
会場には10体の黒い犬の彫刻と、それぞれに対応したスピーカーとライトが配置されています。犬の鳴き声（＝人々の「声」）がスピーカーから流れると、対応するライトが点灯し、黒い犬の姿が浮かび上がります。音に呼応して点滅する光は、犬の影を床に落とし、空間に断続的なリズムと物語の断片を生み出します。
この即興的で非論理的な言語システムには明確な意味も文法も存在しませんが、声のトーン、間、息づかいから、その人の感情や躊躇いがかすかに伝わってきます。意味の欠如が、逆に私たちの想像力を喚起し、新たな感覚の地平をひらいてゆくのです。
「犬の声で語られる日常」は、私たちが日々見逃している、言葉にならない思い、曖昧さ、ズレ、ノイズのなかに、豊かな意味の可能性を見出す試みです。ここにあるのは「伝える」ことの不在ではなく、「感じる」ことの始まりなのです。

I'M JUST A DOG is a sound installation created during an artist residency at Kunstraum Kreuzberg Bethanien in Berlin, supported by Tokyo Wonder Site.
In this work, we conducted interviews with people we encountered in the city, asking them to share a story from their daily life—but with an unusual request: they were to respond using only the sound of a dog's bark. This seemingly nonsensical act intentionally breaks away from the conventional framework of communication, suspending the everyday function of language and questioning how meaning is formed in the first place.
The installation features ten black dog sculptures, each paired with a speaker and a hanging light. When a barking voice (a human voice disguised in the form of a dog's bark) plays from a speaker, the corresponding light flickers on, illuminating the dog and casting its shadow across the room. These sounds and lights interact to create a fragmented rhythm and a shifting sense of presence within the space.
Although this improvised language lacks clear meaning or grammar, the tone, breath, and pauses in the voices subtly reveal each person's emotions, hesitation, and character. It is through this absence of explicit meaning that imagination is invited in, opening a new field of perception.
\"Everyday life, spoken in the voice of a dog\" — this work seeks to explore the richness hidden in ambiguity, misalignment, and noise. In doing so, it turns away from a reality dominated by logic and efficiency, and gestures instead toward new forms of connection and sensation.
 What emerges here is not the absence of communication, but the beginning of feeling."

# 转义特殊字符，以便在sed中使用
ESCAPED_DESCRIPTION=$(echo "$NEW_DESCRIPTION" | sed -e 's/[\/&]/\\&/g')

# 更新所有I'M JUST A DOG开头的installation详情页面
for file in installation/*dog*.html; do
  echo "Updating $file..."
  
  # 检查文件是否包含project-description类
  if grep -q "project-description" "$file"; then
    # 提取当前描述的开始和结束标记
    START_TAG=$(grep -n '<p class="project-description">' "$file" | cut -d: -f1)
    if [ -z "$START_TAG" ]; then
      START_TAG=$(grep -n '<p class="project-description"' "$file" | cut -d: -f1)
    fi
    
    # 寻找结束标记</p>
    END_TAG=$(awk -v start="$START_TAG" 'NR > start && /<\/p>/ {print NR; exit}' "$file")
    
    if [ -n "$START_TAG" ] && [ -n "$END_TAG" ]; then
      # 创建临时文件
      TMP_FILE=$(mktemp)
      
      # 提取文件的开头部分（直到描述开始）
      head -n "$START_TAG" "$file" > "$TMP_FILE"
      
      # 添加新的描述
      echo '<p class="project-description">' >> "$TMP_FILE"
      echo "$NEW_DESCRIPTION" >> "$TMP_FILE"
      echo '</p>' >> "$TMP_FILE"
      
      # 添加文件的结尾部分（从描述结束后开始）
      tail -n +$((END_TAG + 1)) "$file" >> "$TMP_FILE"
      
      # 替换原文件
      mv "$TMP_FILE" "$file"
      
      echo "Updated description in $file"
    else
      echo "Could not find project description in $file"
    fi
  else
    echo "No project-description class found in $file"
  fi
done

echo "Done!" 