let pledge_data = null
let character = null
const proficiencies_box = document.getElementById("proficiency-wrapper")
const container = document.getElementById("container")
const shadow = document.getElementById("shadow")
const style = document.createElement('style');
let listEaseTime = 800 // miliseconds
let list_shown = false
document.head.appendChild(style);


fetch("character.json").then(response => {return response.json()}).then(data => {
    character = data

    fetch("data.json").then(response =>{ return response.json() }).then(data => {
        pledge_data = data
    
        proficiency_types = []
        pledge_data["Work proficiency"].forEach(proficiency => {
            proficiencyName = proficiency["Proficiency"]
            if (proficiencyName === "SANITY") {
                document.getElementById("SANITY").value = character.Proficiencies["SANITY"]
                updateSliderTrack(character.Proficiencies["SANITY"],"SANITY")
                return
            }
            character.Proficiencies[proficiencyName] = find_stat(proficiencyName,character["Profession"],"Proficiencies") || 0
            category = proficiency["Category"]
            if (category && proficiency_types.includes(category) != true) {
                proficiency_types.push(category)
                proficiencies_box.append(create_category_element(category))
            }
        })
    
        update_character_stats()
    })
})


const create_category_element = (categoryName) => {
    categoryContainer = document.createElement("div")
    categoryContainer.classList.add("category")
    categoryContainer.classList.add(put_dash_between_name(categoryName))
    categoryContainer.id = put_dash_between_name(categoryName + "-container")
    categoryContainer.setAttribute("onclick",`javascript: show_category_list("${categoryName}")`)

    categoryContainer.innerHTML = `<p class="category-label">${categoryName}</p>`
    return categoryContainer
}

const show_category_list = (categoryName) => {
    categoryList = document.getElementById(put_dash_between_name(categoryName) + "-list-container")
    if (categoryList) {
        categoryList.remove()
        return
    }

    categoryListContainer = document.createElement("div")
    categoryListContainer.classList.add("category-list-container")
    categoryListContainer.id = put_dash_between_name(categoryName) + "-list-container"
    document.getElementById(put_dash_between_name(categoryName + "-container")).after(categoryListContainer)


    pledge_data["Work proficiency"].forEach(proficiency => {
        if (proficiency["Category"] === categoryName) {
            proficiencyElement = create_proficiency_element(proficiency)
            categoryListContainer.append(proficiencyElement)
            proficiencyElement.value = character.Proficiencies[proficiency["Proficiency"]]
            updateSliderTrack(proficiencyElement.value, put_dash_between_name(proficiency["Proficiency"]))
        }
    })
    
}

/**
 * Creates a DOM element structure for a proficiency, including a title, a range input, and buttons to adjust the proficiency value.
 * @param {Object} proficiency - An object containing a 'Proficiency' key with the name of the proficiency as its value.
 * @returns {HTMLDivElement} - A div element containing the structured elements for the proficiency.*/
const create_proficiency_element = (proficiency) => {
    const proficiencyName = proficiency["Proficiency"];

    const proficiencyContainer = document.createElement("div");
    proficiencyContainer.className = "proficiency-container";
    proficiencyContainer.id = put_dash_between_name(proficiencyName) + "-container"

    const proficiencyValue = find_stat(proficiencyName, character["Profession"], "Proficiencies") || 0
    const proficiencyID = put_dash_between_name(proficiencyName)

    proficiencyContainer.innerHTML = `
    <p class="proficiency-title">${proficiencyName}</p>
    <input type="range" min="${proficiencyValue}" 
    max="5" disabled id="${proficiencyID}" class="proficiency-input" value="${proficiencyValue}" >
    <div class="edit-prof-container">
        <button class="remove-prof-button" onclick="javascript:edit_prof('${proficiencyID}', -1)">-</button>
        <p class="prof-display" id="${proficiencyID}-display">0</p>
        <button class="add-prof-button" onclick="javascript: edit_prof('${proficiencyID}', 1)">+</button>
    </div>
    `

    return proficiencyContainer;
}

// This will need to be fixed holy hell
const updateSliderTrack = (value, id) => {
    document.getElementById(id + "-display").textContent = value
    sheet = style.sheet;
    rules = sheet.cssRules || sheet.rules
    const rule = 
    `#${id}::-webkit-slider-runnable-track {
        width: 100%;
        cursor: pointer;
        background: linear-gradient(to right, lime ${value*20}%, red ${value*20}%);
        border-radius: 10px;
        border: none;
    }`;
    for (let i = 0; i <= rules.length; i++) {
        try {
            if (rules[i].selectorText.startsWith("#" + id)) {
            sheet.deleteRule(i);
            break;
            }
        } catch (TypeError) {
            break
        }
    }
    sheet.insertRule(rule, 0)
    // Insert the new rule
    ;
}

const edit_prof = (id, value) => {
    proficiencyInput = document.getElementById(id) 
    proficiencyInput.value = parseInt(proficiencyInput.value) + value
    character.Proficiencies[id.replace("-", " ")] = parseInt(proficiencyInput.value)
    updateSliderTrack(proficiencyInput.value,id)
    update_character_stats()
}

const find_stat = (stat, type, category) => {
    return pledge_data[category].find(element => element[category] === type)[stat]
}

/**
 * Converts spaces in a given string to dashes, suitable for use as an HTML element ID.
 * @param {string} id - The input string that may contain spaces.
 * @returns {string} - The transformed string with spaces replaced by dashes.
 */
const put_dash_between_name = (id) => {
    return id.replace(" ", "-")
}

const handleEnter = (event) => {
    if (event.key === "Enter") {
        close_list()
    }
}

const show_list = (category) => {
    
    if (list_shown === false) {
        list_shown = true
        list = document.createElement("div")
        list.id = "list-container"
        list.style.animation = `ease-down ${listEaseTime/1000}s ease forwards`

        
        setTimeout(() => {
            list.style.animation = ""
            document.addEventListener("keypress", handleEnter)
            shadow.addEventListener("click",close_list)
        }, listEaseTime);


        label = document.createElement("p")
        label.id = "list-label"
        label.textContent = category
        list.append(label)
        
        shadow.style.transition = `all ease ${listEaseTime/2000}s`
        shadow.style.opacity = "80%"
        shadow.style.zIndex = "1"

        container.append(list)
    }
}

const close_list = () => {
    list = document.getElementById("list-container")
    list.style.animation = ""
    list.style.animation = `ease-up ${listEaseTime/1000}s ease forwards`
    shadow.style.opacity = "0%"
    shadow.style.zIndex = "-1"
    shadow.removeEventListener("click",close_list)
    document.removeEventListener("keypress", handleEnter)
    setTimeout(() => {
        list.style.animation = ""
        container.removeChild(list)
        list_shown = false
    }, listEaseTime);
}

const update_character_stats = () => {
    document.getElementById("character-name").value = character["Name"]
    document.getElementById("profession").textContent = character["Profession"]
    document.getElementById("pledge").textContent = character["Pledge"]
    document.getElementById("ancestry").textContent = character["Ancestry"]
    document.getElementById("mental-condition").textContent = character["Mental Condition"]
    document.getElementById("SANITY").value = character.Proficiencies["SANITY"]
    document.getElementById("pledge-title").textContent = "Follower of " + find_stat("Pledge Title",character["Pledge"], "Pledge")

    stats = ["Strength", "Agility", "Intellect", "Will", "Sociability", "MP"]
    stats.forEach(stat => {
        proficiencyBoost = 0
        pledge_data["Work proficiency"].filter(element => element["Stat Boost"] === stat).forEach(proficiency => {
            proficiencyBoost += parseInt(character.Proficiencies[proficiency["Proficiency"]])
        })

        if (stat === "MP") {
            spellAttackModifier = 0 
            if (find_stat("Spell Attack Modifier",character["Profession"],"Professions") != "None") {
                spellAttackModifier = character[find_stat("Spell Attack Modifier",character["Profession"],"Professions")]
            }
            // Total MP = Profession + Profession Spell Attack Modifier + Magic Proficiency + Will / 2
            character[stat] = Math.floor(
            find_stat("MP",character["Profession"],"Professions") + 
            spellAttackModifier + 
            proficiencyBoost +
            character["Will"]/2
            )
        } else {
            // Normal Stat =  SANITY / 2 + Work prof points / 2 + Ancestry + Physical + Mental + Profession  
            character[stat] = 
            (character.Proficiencies["SANITY"] - 5) +
            (proficiencyBoost/2) +
            find_stat(stat,character["Ancestry"],"Ancestry") + 
            find_stat(stat,character["Mental Condition"],"Mental Condition") + 
            find_stat(stat,character["Profession"],"Professions") 
        }
        

        document.getElementById(stat).textContent = character[stat]
    });


    skillsCheck = document.getElementById("skills-check")
    ancestrySkillHeader = document.getElementById("ancestry-skills-header")
    ancestrySkillParagraph = document.getElementById("ancestry-skills-paragraph")
    professionSkillsHeader = document.getElementById("profession-skills-header")
    professionSkillsParagraph = document.getElementById("profession-skills-paragraph")

    ancestrySkillHeader.innerHTML = `
        ${character["Ancestry"]} Skills: <br>
    `
    ancestrySkillParagraph.innerHTML = `
        ${find_stat("Skill", character["Ancestry"],"Ancestry")} <br> 
        <br>
    `
    professionSkillsHeader.innerHTML = `
        ${character["Profession"]} Skills and Checks: <br>
    `
    professionSkillsParagraph.innerHTML = `
        ${find_stat("Skill", character["Profession"], "Professions")} <br> 
        <br>
        ${find_stat("Check", character["Profession"], "Professions")} <br> 
        <br>
        Saving Throws: ${find_stat("Saving Throws", character["Profession"], "Professions")}
    `
}

document.getElementById('character-image-input').addEventListener('change', function() {
    var fileName = document.getElementById('fileName');
    var input = this;
    var fileContent = document.getElementById('character-image');

    if (input.files.length > 0) {
        var file = input.files[0];
        fileName.textContent = file.name;

        var reader = new FileReader();
        reader.onload = function(e) {
            // Clear any previous content
            fileContent.innerHTML = '';

            // Create an img element and set its src to the file data
            var img = document.createElement('img');
            img.src = e.target.result;
            img.id = "character-image-file"
            fileContent.appendChild(img);
        };

        reader.onerror = function(e) {
            fileContent.textContent = "Error reading file";
        };

        reader.readAsDataURL(file); 
    } else {
        fileName.textContent = 'No file chosen';
        fileContent.textContent = '';
    }
});

