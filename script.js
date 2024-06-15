let pledge_data = null
let data_loaded = false
let character = {}
const proficiencies_box = document.getElementById("proficiency-wrapper")
const big_proficiencies_box = document.getElementById("big-prof-container")
const container = document.getElementById("container")
const shadow = document.getElementById("shadow")
const style = document.createElement('style');
document.head.appendChild(style);

fetch("data.json").then(response => {return response.json()}).then(data => {
    pledge_data = data
    proficiency_types = []
    update_character_stats()
    pledge_data["Work proficiency"].forEach(proficiency => {
        Type = proficiency["Type"]
        if (Type && proficiency_types.includes(Type) != true) {
            proficiency_types.push(Type)
            proficiencies_box.append(create_category_element(Type))
            show_category_list(Type)
        }
        if (!Type) {
            big_prof = create_proficiency_element(proficiency)
            big_prof.classList.add("big_prof")
            big_proficiencies_box.append(big_prof)
        }
    })
    update_character_stats()
    data_loaded = true
})

const create_category_element = (categoryName) => {
    categoryContainer = document.createElement("div")
    categoryContainer.classList.add("category")
    categoryContainer.classList.add(put_dash_between_name(categoryName))
    categoryContainer.id = put_dash_between_name(categoryName + "-container")
    categoryContainer.setAttribute("onclick",`javascript: show_category_list("${categoryName}")`)

    categoryLabel = document.createElement("p")
    categoryLabel.className = "category-label"
    categoryLabel.textContent = categoryName
    categoryContainer.append(categoryLabel)

    icon = document.createElement("i");
    icon.className = "fa-solid fa-caret-down dropdown-icon";
    categoryContainer.append(icon)
    
    return categoryContainer
}

const show_category_list = (categoryName) => {
    if (document.getElementById(put_dash_between_name(categoryName) + "-list-container")) {
        document.getElementById(put_dash_between_name(categoryName) + "-list-container").remove()
        return
    }
    categoryListContainer = document.createElement("div")
    categoryListContainer.classList.add(put_dash_between_name(categoryName))
    categoryListContainer.classList.add("category-list-container")
    categoryListContainer.id = put_dash_between_name(categoryName) + "-list-container"

    document.getElementById(put_dash_between_name(categoryName + "-container")).after(categoryListContainer)

    pledge_data["Work proficiency"].forEach(proficiency => {
        if (proficiency["Type"] === categoryName) {
            categoryListContainer.append(create_proficiency_element(proficiency))
            proficiencyID = put_dash_between_name(proficiency["Proficiency"])
            proficiencyName = proficiency["Proficiency"]
            proficiencyInput = document.getElementById(proficiencyID)
            if (data_loaded === false) {
                if (find_stat(proficiency["Proficiency"],character.profession,"Proficiencies")) {
                    character[proficiencyName] = find_stat(proficiency["Proficiency"],character.profession,"Proficiencies")
                } else {
                    character[proficiencyName] = 0
                }
                
            } 
            proficiencyInput.value = character[proficiencyName]
            edit_prof(proficiencyInput.id,0)
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

    const proficiencyTitle = document.createElement("p");
    proficiencyTitle.className = "proficiency-title";
    proficiencyTitle.textContent = proficiencyName;
    proficiencyContainer.append(proficiencyTitle);

    const proficiencyInput = document.createElement("input");
    proficiencyInput.type = "range";
    proficiencyInput.min = "0";
    proficiencyInput.max = "5";
    proficiencyInput.disabled = true;
    proficiencyInput.id = put_dash_between_name(proficiencyName);
    proficiencyInput.className = "proficiency-input";
    proficiencyContainer.append(proficiencyInput);

    const editProfContainer = document.createElement("div");
    editProfContainer.className = "edit-prof-container";
    proficiencyContainer.append(editProfContainer);

    const removeProf = document.createElement("button");
    removeProf.className = "remove-prof-button";
    removeProf.setAttribute("onclick", `javascript: edit_prof("${proficiencyInput.id}", -1)`);
    removeProf.textContent = "-";
    editProfContainer.append(removeProf);

    const profDisplay = document.createElement("p");
    profDisplay.className = "prof-display";
    profDisplay.id = `${proficiencyInput.id}-display`;
    profDisplay.textContent = 0;
    editProfContainer.append(profDisplay);

    const addProf = document.createElement("button");
    addProf.className = "add-prof-button";
    addProf.setAttribute("onclick", `javascript: edit_prof("${proficiencyInput.id}", 1)`);
    addProf.textContent = "+";
    editProfContainer.append(addProf);

    return proficiencyContainer;
}

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
    document.getElementById(id).value = parseInt(document.getElementById(id).value) + value
    character[id] = document.getElementById(id).value
    updateSliderTrack(document.getElementById(id).value,id)
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
    let output = "";
    id.split("").forEach(letter => {
        output += letter === " " ? "-" : letter;
    });
    return id.replace(" ", "-")
}

const handleEnter = (event) => {
    if (event.key === "Enter") {
        close_list()
    }
}

let listEaseTime = 800 // miliseconds
let list_shown = false
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
        shadow.style.opacity = "70%"
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
    character.profession = document.getElementById("profession").textContent
    character.pledge = document.getElementById("pledge").textContent
    character.ancestry = document.getElementById("ancestry").textContent
    character.physical_condition = document.getElementById("physical-condition").textContent
    character.mental_condition = document.getElementById("mental-condition").textContent

    stats = ["Strength", "Agility", "Intellect", "Will", "Sociability"]
    // Total Stat =  Sanity / 2 + Work prof points / 2 + Ancestry + Physical + Mental + Profession  
    stats.forEach(stat => {
        proficiencyBoost = 0
        pledge_data["Work proficiency"].filter(element => element["Stat Boost"] === stat).forEach(proficiency => {
            proficiencyBoost += parseInt(character[proficiency["Proficiency"]])
        })

        document.getElementById(stat).textContent = 
        find_stat(stat,character.ancestry,"Ancestry") + 
        find_stat(stat,character.physical_condition,"Physical Condition") + 
        find_stat(stat,character.mental_condition,"Mental Condition") + 
        find_stat(stat,character.profession,"Professions") + 
        (proficiencyBoost/2)

    });

    skillsCheck = document.getElementById("skills-check")

    skillsCheck.innerHTML = `
        ${character.ancestry} Skills: <br>
        ${find_stat("Skill", character.ancestry,"Ancestry")} <br> 
        <br>
        ${character.profession} Skills and Checks: <br>
        ${find_stat("Skill", character.profession, "Professions")} <br> 
        <br>
        ${find_stat("Check", character.profession, "Professions")} <br> 
        <br>
        Saving Throws: ${find_stat("Saving Throws", character.profession, "Professions")}
    `
}



