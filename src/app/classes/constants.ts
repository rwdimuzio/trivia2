export class Constants {
    
    // source https://opentdb.com/api_category.php
    public static readonly categories = [
        { "id":  9, "type": "E", "name": "General Knowledge" },
        { "id": 10, "type": "AL", "name": "Entertainment: Books" },
        { "id": 11, "type": "E", "name": "Entertainment: Film" },
        { "id": 12, "type": "E", "name": "Entertainment: Music" },
        { "id": 13, "type": "E", "name": "Entertainment: Musicals & Theatres" },
        { "id": 14, "type": "E", "name": "Entertainment: Television" },
        { "id": 15, "type": "E", "name": "Entertainment: Video Games" },
        { "id": 16, "type": "E", "name": "Entertainment: Board Games" },
        { "id": 17, "type": "SN", "name": "Science & Nature" },
        { "id": 18, "type": "SN", "name": "Science: Computers" },
        { "id": 19, "type": "SN", "name": "Science: Mathematics" },
        { "id": 20, "type": "AL", "name": "Mythology" },
        { "id": 21, "type": "SL", "name": "Sports" },
        { "id": 22, "type": "G", "name": "Geography" },
        { "id": 23, "type": "H", "name": "History" },
        { "id": 24, "type": "H", "name": "Politics" },
        { "id": 25, "type": "AL", "name": "Art" },
        { "id": 26, "type": "E", "name": "Celebrities" },
        { "id": 27, "type": "SN", "name": "Animals" },
        { "id": 28, "type": "SN", "name": "Vehicles" },
        { "id": 29, "type": "AL", "name": "Entertainment: Comics" },
        { "id": 30, "type": "SN", "name": "Science: Gadgets" },
        { "id": 31, "type": "AL", "name": "Entertainment: Japanese Anime & Manga" },
        { "id": 32, "type": "AL", "name": "Entertainment: Cartoon & Animations" }
    ];
    /**
     * Get the trivial pursuit code for the question
     * @param question 
     * @returns a string coresponding to original TP codes
     */
    public static getCategoryType(question){
        var f = this.categories.filter(r => r.name == question.category);
        if(f.length){
            return f[0].type;
        }
        return "";
    }
}
