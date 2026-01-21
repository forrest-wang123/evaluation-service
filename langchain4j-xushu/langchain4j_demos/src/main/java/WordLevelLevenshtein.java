import java.util.*;

// 单词操作类型枚举
enum WordOperationType {
    MATCH,      // 单词匹配
    INSERT,     // 插入单词
    DELETE,     // 删除单词
    SUBSTITUTE  // 替换单词
}

// 单词操作记录类
class WordEditOperation {
    WordOperationType type;
    String wordA;      // 源单词（DELETE或SUBSTITUTE时使用）
    String wordB;      // 目标单词（INSERT或SUBSTITUTE时使用）
    int position;      // 在源文本中的单词位置（0-based）

    public WordEditOperation(WordOperationType type, String wordA, String wordB, int position) {
        this.type = type;
        this.wordA = wordA;
        this.wordB = wordB;
        this.position = position;
    }

    @Override
    public String toString() {
        switch (type) {
            case MATCH:
                return String.format("保留单词 [%s]", wordA);
            case INSERT:
                return String.format("在位置 %d 插入单词 [%s]", position, wordB);
            case DELETE:
                return String.format("删除位置 %d 的单词 [%s]", position, wordA);
            case SUBSTITUTE:
                return String.format("将位置 %d 的单词 [%s] 替换为 [%s]",
                        position, wordA, wordB);
            default:
                return "未知操作";
        }
    }
}

// 单词级编辑结果类
class WordEditResult {
    int distance;
    List<WordEditOperation> operations;
    List<String> transformedText;

    public WordEditResult(int distance, List<WordEditOperation> operations, List<String> transformedText) {
        this.distance = distance;
        this.operations = operations;
        this.transformedText = transformedText;
    }

    public void printResult() {
        System.out.println("单词编辑距离: " + distance);
        System.out.println("\n操作序列:");
        for (int i = 0; i < operations.size(); i++) {
            System.out.printf("%2d. %s\n", i + 1, operations.get(i));
        }
        System.out.println("\n最终文本:");
        System.out.println(String.join(" ", transformedText));
    }

    // 获取合并后的文本字符串
    public String getTransformedString() {
        return String.join(" ", transformedText);
    }
}

public class WordLevelLevenshtein {

    /**
     * 将文本分割成单词列表（支持自定义分隔符）
     */
    public static List<String> splitIntoWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }
        // 按空格、标点等分割单词
        String[] words = text.split("\\s+");
        return new ArrayList<>(Arrays.asList(words));
    }

    /**
     * 计算单词级别的Levenshtein距离并返回操作序列
     */
    public static WordEditResult wordLevelLevenshtein(String sourceText, String targetText) {
        return wordLevelLevenshtein(
                splitIntoWords(sourceText),
                splitIntoWords(targetText)
        );
    }

    /**
     * 核心算法：处理单词列表
     */
    public static WordEditResult wordLevelLevenshtein(List<String> sourceWords, List<String> targetWords) {
        int m = sourceWords.size();
        int n = targetWords.size();

        // DP表：存储距离
        int[][] dp = new int[m + 1][n + 1];

        // 方向表：用于回溯操作路径
        // 0: 从左上角来（匹配或替换）
        // 1: 从左边来（插入）
        // 2: 从上边来（删除）
        int[][] direction = new int[m + 1][n + 1];

        // 初始化边界
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;
            direction[i][0] = 2; // 从上边来（删除）
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;
            direction[0][j] = 1; // 从左边来（插入）
        }

        // 填充DP表和方向表
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (sourceWords.get(i - 1).equals(targetWords.get(j - 1))) {
                    // 单词相同，匹配操作
                    dp[i][j] = dp[i - 1][j - 1];
                    direction[i][j] = 0; // 从左上角来（匹配）
                } else {
                    // 计算三种操作的代价
                    int insertCost = dp[i][j - 1] + 1;
                    int deleteCost = dp[i - 1][j] + 1;
                    int substituteCost = dp[i - 1][j - 1] + 1;

                    // 取最小代价
                    int minCost = Math.min(Math.min(insertCost, deleteCost), substituteCost);
                    dp[i][j] = minCost;

                    // 记录操作方向
                    if (minCost == substituteCost) {
                        direction[i][j] = 0; // 替换
                    } else if (minCost == insertCost) {
                        direction[i][j] = 1; // 插入
                    } else {
                        direction[i][j] = 2; // 删除
                    }
                }
            }
        }

        // 回溯获取操作序列
        List<WordEditOperation> operations = new ArrayList<>();
        List<String> currentText = new ArrayList<>(sourceWords);

        int i = m, j = n;

        while (i > 0 || j > 0) {
            int dir = direction[i][j];

            switch (dir) {
                case 0: // 从左上角来（匹配或替换）
                    if (i > 0 && j > 0) {
                        if (sourceWords.get(i - 1).equals(targetWords.get(j - 1))) {
                            // 匹配操作
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.MATCH,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                        } else {
                            // 替换操作
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.SUBSTITUTE,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                            // 在实际文本中替换单词
                            if (i - 1 < currentText.size()) {
                                currentText.set(i - 1, targetWords.get(j - 1));
                            }
                        }
                        i--;
                        j--;
                    }
                    break;

                case 1: // 从左边来（插入）
                    if (j > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.INSERT,
                                null, // 源单词为空
                                targetWords.get(j - 1),
                                i // 在当前i位置插入
                        ));
                        // 在实际文本中插入单词
                        if (i <= currentText.size()) {
                            currentText.add(i, targetWords.get(j - 1));
                        }
                        j--;
                    }
                    break;

                case 2: // 从上边来（删除）
                    if (i > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.DELETE,
                                sourceWords.get(i - 1),
                                null, // 目标单词为空
                                i - 1
                        ));
                        // 在实际文本中删除单词
                        if (i - 1 < currentText.size()) {
                            currentText.remove(i - 1);
                        }
                        i--;
                    }
                    break;
            }
        }

        return new WordEditResult(dp[m][n], operations, currentText);
    }

    /**
     * 带相似度阈值的版本（单词不完全相等时考虑相似度）
     */
    public static WordEditResult wordLevelLevenshteinWithSimilarity(
            String sourceText, String targetText, double similarityThreshold) {
        return wordLevelLevenshteinWithSimilarity(
                splitIntoWords(sourceText),
                splitIntoWords(targetText),
                similarityThreshold
        );
    }

    /**
     * 考虑单词相似度的版本（如拼写错误、同义词等）
     */
    public static WordEditResult wordLevelLevenshteinWithSimilarity(
            List<String> sourceWords, List<String> targetWords, double similarityThreshold) {

        int m = sourceWords.size();
        int n = targetWords.size();

        int[][] dp = new int[m + 1][n + 1];
        int[][] direction = new int[m + 1][n + 1];

        // 初始化
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;
            direction[i][0] = 2;
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;
            direction[0][j] = 1;
        }

        // 计算单词相似度矩阵
        double[][] similarity = new double[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                similarity[i][j] = calculateWordSimilarity(
                        sourceWords.get(i), targetWords.get(j)
                );
            }
        }

        // 填充DP表
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                double sim = similarity[i - 1][j - 1];

                if (sim >= similarityThreshold) {
                    // 相似度足够高，视为匹配
                    dp[i][j] = dp[i - 1][j - 1];
                    direction[i][j] = 0; // 匹配
                } else {
                    // 计算三种操作的代价
                    int insertCost = dp[i][j - 1] + 1;
                    int deleteCost = dp[i - 1][j] + 1;
                    // 替换代价考虑相似度
                    int substituteCost = dp[i - 1][j - 1] +
                            (sim > 0.5 ? 0 : 1); // 如果相似度较高，替换代价小

                    int minCost = Math.min(Math.min(insertCost, deleteCost), substituteCost);
                    dp[i][j] = minCost;

                    if (minCost == substituteCost) {
                        direction[i][j] = 0; // 替换
                    } else if (minCost == insertCost) {
                        direction[i][j] = 1; // 插入
                    } else {
                        direction[i][j] = 2; // 删除
                    }
                }
            }
        }

        // 回溯获取操作序列
        return buildResultWithBacktracking(dp, direction, sourceWords, targetWords, similarity, similarityThreshold);
    }

    /**
     * 计算两个单词的相似度（简单实现：基于字符的Levenshtein距离）
     */
    private static double calculateWordSimilarity(String word1, String word2) {
        if (word1.equalsIgnoreCase(word2)) {
            return 1.0;
        }

        // 计算字符级别的编辑距离
        int maxLen = Math.max(word1.length(), word2.length());
        if (maxLen == 0) return 1.0;

        int editDistance = calculateCharLevenshtein(word1.toLowerCase(), word2.toLowerCase());
        return 1.0 - (double) editDistance / maxLen;
    }

    /**
     * 字符级别的Levenshtein距离计算
     */
    private static int calculateCharLevenshtein(String a, String b) {
        int m = a.length();
        int n = b.length();

        int[] prev = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j;

        for (int i = 1; i <= m; i++) {
            int[] curr = new int[n + 1];
            curr[0] = i;

            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    curr[j] = prev[j - 1];
                } else {
                    curr[j] = Math.min(
                            Math.min(prev[j] + 1, curr[j - 1] + 1),
                            prev[j - 1] + 1
                    );
                }
            }
            prev = curr;
        }

        return prev[n];
    }

    /**
     * 构建结果（带相似度考虑）
     */
    private static WordEditResult buildResultWithBacktracking(
            int[][] dp, int[][] direction,
            List<String> sourceWords, List<String> targetWords,
            double[][] similarity, double threshold) {

        int m = sourceWords.size();
        int n = targetWords.size();

        List<WordEditOperation> operations = new ArrayList<>();
        List<String> currentText = new ArrayList<>(sourceWords);

        int i = m, j = n;

        while (i > 0 || j > 0) {
            int dir = direction[i][j];

            switch (dir) {
                case 0: // 匹配或替换
                    if (i > 0 && j > 0) {
                        double sim = similarity[i - 1][j - 1];
                        if (sim >= threshold) {
                            // 视为匹配（即使单词不完全相同）
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.MATCH,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                        } else {
                            // 替换
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.SUBSTITUTE,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                            if (i - 1 < currentText.size()) {
                                currentText.set(i - 1, targetWords.get(j - 1));
                            }
                        }
                        i--;
                        j--;
                    }
                    break;

                case 1: // 插入
                    if (j > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.INSERT,
                                null,
                                targetWords.get(j - 1),
                                i
                        ));
                        if (i <= currentText.size()) {
                            currentText.add(i, targetWords.get(j - 1));
                        }
                        j--;
                    }
                    break;

                case 2: // 删除
                    if (i > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.DELETE,
                                sourceWords.get(i - 1),
                                null,
                                i - 1
                        ));
                        if (i - 1 < currentText.size()) {
                            currentText.remove(i - 1);
                        }
                        i--;
                    }
                    break;
            }
        }

        return new WordEditResult(dp[m][n], operations, currentText);
    }

    /**
     * 可视化单词级别的DP表
     */
    public static void printWordDPTable(String sourceText, String targetText) {
        List<String> sourceWords = splitIntoWords(sourceText);
        List<String> targetWords = splitIntoWords(targetText);

        System.out.println("\n===== 单词级别DP表 =====");
        System.out.println("源文本: " + sourceText);
        System.out.println("目标文本: " + targetText);
        System.out.println();

        int m = sourceWords.size();
        int n = targetWords.size();

        // 重新计算DP表
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (sourceWords.get(i - 1).equals(targetWords.get(j - 1))) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + 1
                    );
                }
            }
        }

        // 打印表头
        System.out.print("         ");
        for (int j = 0; j <= n; j++) {
            if (j == 0) System.out.print("Ø       ");
            else System.out.printf("%-8s", targetWords.get(j - 1));
        }
        System.out.println();

        // 打印表格
        for (int i = 0; i <= m; i++) {
            if (i == 0) System.out.print("Ø       ");
            else System.out.printf("%-8s", sourceWords.get(i - 1));

            for (int j = 0; j <= n; j++) {
                System.out.printf("%-8d", dp[i][j]);
            }
            System.out.println();
        }

        System.out.println("\n编辑距离: " + dp[m][n]);
    }
}

class WeightedWordLevenshtein {

    /**
     * 带权重的单词编辑距离
     * 可以为不同类型单词分配不同权重（如停用词权重低，关键词权重高）
     */
    public static WordEditResult weightedWordLevenshtein(
            String sourceText, String targetText,
            Map<String, Integer> wordWeights,
            int insertWeight, int deleteWeight, int substituteWeight) {

        List<String> sourceWords = splitIntoWords(sourceText);
        List<String> targetWords = splitIntoWords(targetText);

        int m = sourceWords.size();
        int n = targetWords.size();

        int[][] dp = new int[m + 1][n + 1];
        int[][] direction = new int[m + 1][n + 1];

        // 初始化边界
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i * deleteWeight;
            direction[i][0] = 2;
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j * insertWeight;
            direction[0][j] = 1;
        }

        // 填充DP表
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                String srcWord = sourceWords.get(i - 1);
                String tgtWord = targetWords.get(j - 1);

                if (srcWord.equals(tgtWord)) {
                    dp[i][j] = dp[i - 1][j - 1];
                    direction[i][j] = 0;
                } else {
                    // 获取单词权重
                    int srcWeight = wordWeights.getOrDefault(srcWord.toLowerCase(), 1);
                    int tgtWeight = wordWeights.getOrDefault(tgtWord.toLowerCase(), 1);

                    // 加权代价
                    int insertCost = dp[i][j - 1] + insertWeight * tgtWeight;
                    int deleteCost = dp[i - 1][j] + deleteWeight * srcWeight;
                    int substituteCost = dp[i - 1][j - 1] + substituteWeight * Math.max(srcWeight, tgtWeight);

                    int minCost = Math.min(Math.min(insertCost, deleteCost), substituteCost);
                    dp[i][j] = minCost;

                    if (minCost == substituteCost) {
                        direction[i][j] = 0;
                    } else if (minCost == insertCost) {
                        direction[i][j] = 1;
                    } else {
                        direction[i][j] = 2;
                    }
                }
            }
        }

        // 回溯构建结果
        return buildWeightedResult(dp, direction, sourceWords, targetWords);
    }

    private static List<String> splitIntoWords(String text) {
        return WordLevelLevenshtein.splitIntoWords(text);
    }

    private static WordEditResult buildWeightedResult(
            int[][] dp, int[][] direction,
            List<String> sourceWords, List<String> targetWords) {

        int m = sourceWords.size();
        int n = targetWords.size();

        List<WordEditOperation> operations = new ArrayList<>();
        List<String> currentText = new ArrayList<>(sourceWords);

        int i = m, j = n;

        while (i > 0 || j > 0) {
            int dir = direction[i][j];

            switch (dir) {
                case 0:
                    if (i > 0 && j > 0) {
                        if (sourceWords.get(i - 1).equals(targetWords.get(j - 1))) {
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.MATCH,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                        } else {
                            operations.add(0, new WordEditOperation(
                                    WordOperationType.SUBSTITUTE,
                                    sourceWords.get(i - 1),
                                    targetWords.get(j - 1),
                                    i - 1
                            ));
                            if (i - 1 < currentText.size()) {
                                currentText.set(i - 1, targetWords.get(j - 1));
                            }
                        }
                        i--;
                        j--;
                    }
                    break;

                case 1:
                    if (j > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.INSERT,
                                null,
                                targetWords.get(j - 1),
                                i
                        ));
                        if (i <= currentText.size()) {
                            currentText.add(i, targetWords.get(j - 1));
                        }
                        j--;
                    }
                    break;

                case 2:
                    if (i > 0) {
                        operations.add(0, new WordEditOperation(
                                WordOperationType.DELETE,
                                sourceWords.get(i - 1),
                                null,
                                i - 1
                        ));
                        if (i - 1 < currentText.size()) {
                            currentText.remove(i - 1);
                        }
                        i--;
                    }
                    break;
            }
        }

        return new WordEditResult(dp[m][n], operations, currentText);
    }
}
