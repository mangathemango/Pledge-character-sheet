let pledge_data = null
let character = null
const proficiencies_box = document.getElementById("proficiency-wrapper")
const container = document.getElementById("container")
const shadow = document.getElementById("shadow")
const style = document.createElement('style');
const physicalConditionBox = document.getElementById("physical-condition-container")
let listEaseTime = 800 // miliseconds
let list_shown = false
document.head.appendChild(style);


fetch("character.json").then(response => {return response.json()}).then(data => {
    character = data

    fetch("data.json").then(response =>{ return response.json() }).then(data => {
        pledge_data = data
    
        proficiency_types = []
        pledge_data["Work proficiency"].forEach(proficiency => {
            const proficiencyName = proficiency["Proficiency"]
            const characterSanity = character.Proficiencies["SANITY"]
            if (proficiencyName === "SANITY") {
                document.getElementById("SANITY").value = characterSanity
                updateSliderTrack(characterSanity,"SANITY")
                return
            }
            const professionProficiency = find_stat(proficiencyName,character["Profession"],"Proficiencies")

            let characterProficiency = character.Proficiencies[proficiencyName]
            
            if (!characterProficiency) {
                character.Proficiencies[proficiencyName] = professionProficiency || 0
            } else {
                if (characterProficiency > 5) {
                    character.Proficiencies[proficiencyName] = 5
                } 
                if (characterProficiency < professionProficiency) {
                    character.Proficiencies[proficiencyName] = professionProficiency
                }
            }

            category = proficiency["Category"]
            if (category && proficiency_types.includes(category) != true) {
                proficiency_types.push(category)
                proficiencies_box.append(create_category_element(category))
            }
        })

        pledge_data["Body Part Stats"].forEach(bodyPart => {
            physicalConditionBox.append(create_body_part_element(bodyPart))
            if (character["Physical Condition"][bodyPart["Body Part"]] != "disabled") {
                updateSliderTrack(character["Physical Condition"][bodyPart["Body Part"]],put_dash_between_name(bodyPart["Body Part"]))
            }
            
        })
    
        update_character_stats()
        show_list("Ancestry")

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

    const proficiencyMin = find_stat(proficiencyName, character["Profession"], "Proficiencies") || 0
    const proficiencyValue = character.Proficiencies[proficiencyName] || proficiencyMin
    const proficiencyID = put_dash_between_name(proficiencyName)
    const proficiencyNote = proficiency["Note"]

    proficiencyContainer.innerHTML = `
    <p class="proficiency-title" title="${proficiencyNote? proficiencyNote : ''}">${proficiencyName}</p>
    <input type="range" min="${proficiencyMin}" max="5" disabled id="${proficiencyID}" class="proficiency-input" value="${proficiencyValue}" >
    <div class="edit-prof-container">
        <button class="remove-prof-button" onclick="javascript:edit_prof('${proficiencyID}', -1)">-</button>
        <p class="prof-display" id="${proficiencyID}-display">0</p>
        <button class="add-prof-button" onclick="javascript: edit_prof('${proficiencyID}', 1)">+</button>
    </div>
    `

    return proficiencyContainer;
}

const create_body_part_element = (bodyPart) => {
    const bodyPartName = bodyPart["Body Part"] 
    const bodyPartContainer = document.createElement("div");
    bodyPartContainer.className = "proficiency-container body-part-container";
    bodyPartContainer.id = put_dash_between_name(bodyPartName) + "-container"

    const bodyPartID = put_dash_between_name(bodyPartName)
    const bodyPartValue = character["Physical Condition"][bodyPartName]

    bodyPartContainer.innerHTML = `
    <p class="proficiency-title">${bodyPartName}</p>
    <input type="range" min="${0}" 
    max="5" disabled id="${bodyPartID}" class="proficiency-input" value="${bodyPartValue}" >
    <div class="edit-prof-container">
        <button class="remove-prof-button" onclick="javascript:editBodyPart('${bodyPartID}', -1)">-</button>
        <p class="prof-display" id="${bodyPartID}-display">0</p>
        <button class="add-prof-button" onclick="javascript:editBodyPart('${bodyPartID}', 1)">+</button>
    </div>
    `
    if (bodyPartValue === "disabled") {
        bodyPartContainer.innerHTML = `
        <p class="proficiency-title">${bodyPartName}</p>
        <p class="disabled-text">DISABLED</p>
        `
    }
    
    return bodyPartContainer
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

const editBodyPart = (id, value) => {
    bodyPartInput = document.getElementById(id) 
    bodyPartInput.value = parseInt(bodyPartInput.value) + value
    character["Physical Condition"][id.replace("-", " ")] = parseInt(bodyPartInput.value)
    updateSliderTrack(bodyPartInput.value,id)
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

        shadow.style.transition = `all ease ${listEaseTime/2000}s`
        shadow.style.opacity = "80%"
        shadow.style.zIndex = "1"

        list.innerHTML = `<p id="list-label">${category}</p>`
        container.append(list)
        if (category === "Ancestry") {
            const ancestryContainer = document.createElement("div")
            ancestryContainer.id = "ancestries-wrapper"
            list.append(ancestryContainer)

            pledge_data["Ancestry"].forEach(Ancestry => {
                AncestryName = Ancestry["Ancestry"]
                AncestrySkills = Ancestry["Skill"].split("<br><br>").map(skill => skill.split(":")[0].replace("  ", ""))
                ancestryContainer.innerHTML += `
                <div id=${AncestryName}-container class="ancestry-container" onclick='javascript:change_stat("${AncestryName}","Ancestry")'>
                    <p class="ancestry-title">${AncestryName}</p>
                    <img src="" alt="Picture of ${AncestryName}" class="ancestry-img">
                    <table border="1" class="ancestry-stat-table">
                        <tr class="ancestry-stat-label">
                            <th class="ancestry-label">STR</th>
                            <th class="ancestry-label">AGI</th>
                            <th class="ancestry-label">INT</th>
                            <th class="ancestry-label">WIL</th>
                            <th class="ancestry-label">SCB</th>
                        </tr>
                        <td class="ancestry-stat">+${Ancestry["Strength"]}</td>  
                        <td class="ancestry-stat">+${Ancestry["Agility"]}</td>
                        <td class="ancestry-stat">+${Ancestry["Intellect"]}</td>
                        <td class="ancestry-stat">+${Ancestry["Will"]}</td>
                        <td class="ancestry-stat">+${Ancestry["Sociability"]}</td>                      
                    </table>
                    <div class="ancestry-skill-container">
                        <p class="ancestry-skill-label">Skills</p>
                        <div class="ancestry-skill-wrapper">
                            <p class="ancestry-skill">${AncestrySkills[0]}</p>
                            <p class="ancestry-skill">${AncestrySkills[1]}</p>
                        </div>
                    </div>
                    <p class="ancestry-view-more" id="${AncestryName}-selected">${AncestryName === character["Ancestry"]? 'SELECTED' : ''}</p>
                </div>
                `
            })
            document.querySelectorAll(".ancestry-container").forEach( ancestryWrapper => {
                ancestryWrapper.addEventListener("mousedown", () => {
                    ancestryWrapper.style.transform = "translateY(0px)"
                })
                ancestryWrapper.addEventListener("mouseup", () => {
                    ancestryWrapper.style.transform = "translateY(-10px)"
                })
                ancestryWrapper.addEventListener("mouseover", () => {
                    ancestryWrapper.style.transform = "translateY(-10px)"
                })
                ancestryWrapper.addEventListener("mouseleave", () => {
                    ancestryWrapper.style.transform = "translateY(0px)"
                })
            })
        }
        
    }
}

const change_stat = (value, stat) => {
    document.getElementById(character[stat] + "-selected").textContent = ""
    character[stat] = value
    document.getElementById(character[stat] + "-selected").textContent = "SELECTED"
    update_character_stats()
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
        
        bodyPartReducts = 0
        bodyPartValue = 5
        pledge_data["Body Part Stats"].filter(element => element["Stat Reducts"].split(" ").includes(stat)).forEach(bodyPart => {
            const bodyPartName = bodyPart["Body Part"]
            if (character["Physical Condition"][bodyPartName] != "disabled") {
                bodyPartValue = character["Physical Condition"][bodyPartName]
            } else {
                bodyPartValue = 0
            }
            bodyPartReducts += (5 - bodyPartValue)
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
            find_stat(stat,character["Profession"],"Professions") -
            (bodyPartReducts / 2)
        }        

        document.getElementById(stat).textContent = character[stat]
    });

    // Skills Check and Saving Throws 
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

// This is for the future "Export Character" function 
let characterSaved = true
window.addEventListener('beforeunload', function (event) {
    if (!characterSaved) {
        event.preventDefault();
    }
    event.returnValue = '';
});