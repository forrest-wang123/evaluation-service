import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // 示例1：基本单词比较
        System.out.println("示例1: 简单句子比较");
        String source1 = "I love programming in Java";
        String target1 = "I love coding in Python";

        WordEditResult result1 = WordLevelLevenshtein.wordLevelLevenshtein(source1, target1);
        result1.printResult();

        System.out.println("\n" + "=".repeat(60) + "\n");

        // 示例2：可视化DP表
        System.out.println("示例2: 可视化单词DP表");
        WordLevelLevenshtein.printWordDPTable("the quick brown fox", "a quick brown dog");

        System.out.println("\n" + "=".repeat(60) + "\n");

        // 示例3：带相似度的比较（处理拼写错误）
        System.out.println("示例3: 带相似度的单词比较");
        String source3 = "I hav a apple";
        String target3 = "I have an apple";

        WordEditResult result3 = WordLevelLevenshtein.wordLevelLevenshteinWithSimilarity(
                source3, target3, 0.7
        );
        result3.printResult();

        System.out.println("\n" + "=".repeat(60) + "\n");

        // 示例4：段落比较
        System.out.println("示例4: 段落文本比较");
        String source4 = "The cat sat on the mat. It was a sunny day.";
        String target4 = "A cat sat on the mat. It was a bright sunny day.";

        WordEditResult result4 = WordLevelLevenshtein.wordLevelLevenshtein(source4, target4);
        result4.printResult();

        System.out.println("\n" + "=".repeat(60) + "\n");

        // 示例5：带权重的比较
        System.out.println("示例5: 带权重的单词编辑距离");

        // 定义单词权重（关键词权重高，停用词权重低）
        Map<String, Integer> wordWeights = new HashMap<>();
        wordWeights.put("important", 3);
        wordWeights.put("critical", 3);
        wordWeights.put("the", 1);
        wordWeights.put("a", 1);
        wordWeights.put("is", 1);

        String source5 = "This is important information";
        String target5 = "This is critical information";

        WordEditResult result5 = WeightedWordLevenshtein.weightedWordLevenshtein(
                source5, target5, wordWeights, 1, 1, 2
        );
        result5.printResult();

        // 示例6：长文本比较
        System.out.println("\n" + "=".repeat(60) + "\n");
        System.out.println("示例6: 长文本比较");

        String source6 = "Machine learning is a subset of artificial intelligence " +
                "that focuses on building systems that learn from data.";
        String target6 = "Machine learning is a branch of artificial intelligence " +
                "that involves building systems capable of learning from data.";

        WordEditResult result6 = WordLevelLevenshtein.wordLevelLevenshtein(source6, target6);
        System.out.println("编辑距离: " + result6.distance);
        System.out.println("\n前10个操作:");
        for (int i = 0; i < Math.min(10, result6.operations.size()); i++) {
            System.out.printf("%2d. %s\n", i + 1, result6.operations.get(i));
        }

        // 显示统计信息
        System.out.println("\n统计信息:");
        System.out.println("源文本单词数: " + WordLevelLevenshtein.splitIntoWords(source6).size());
        System.out.println("目标文本单词数: " + WordLevelLevenshtein.splitIntoWords(target6).size());
        System.out.println("操作总数: " + result6.operations.size());
    }
}