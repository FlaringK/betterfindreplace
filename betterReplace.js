let currentReplacement = []

// Clear mods
document.querySelectorAll("#new .mod textarea").forEach(e => { e.value = "" })

const modSection = document.querySelector("#new .mod").cloneNode(true)
const saveSection = document.querySelector("#saves .savedReplacement").cloneNode(true)
const saveKey = "saves"

// NEW REPLACEMENT

const addModifier = () => {
  document.getElementById("modifiers").appendChild(modSection.cloneNode(true))
}

const removeModifier = el => {
  el.parentElement.parentElement.remove()
  updateCurrentReplacement()
}

const toggleLiveUpdate = el => {
  currentReplacement = el.className == "on" ? [] : currentReplacement
  el.className = el.className == "on" ? "off" : "on"
  updateCurrentReplacement()
}

const clearModifiers = () => {
  document.getElementById("modifiers").innerHTML = ""
  updateCurrentReplacement()
}

const moveModUp = el => {
  document.getElementById("modifiers").insertBefore(el.parentElement.parentElement, el.parentElement.parentElement.previousSibling)
}

const moveModDown = el => {
  document.getElementById("modifiers").insertBefore(el.parentElement.parentElement, el.parentElement.parentElement.nextSibling.nextSibling)
}

const inputToOutput = () => {
  document.getElementById("input").value = document.getElementById("output").value
  document.getElementById("output").value = ""
  replaceText()
}

const updateCurrentReplacement = () => {
  if (document.querySelector("#liveUpdate.on")) generateCurrentReplacement()
  replaceText()
}

const openDialog = id => {
  document.getElementById(id).showModal()
}

const closeDialog = id => {
  document.getElementById(id).close()
}

const saveNewReplacement = () => {
  generateCurrentReplacement()
  let savedReplacements = getSavedReplacements()
  let newSaveName = document.querySelector("#saveDialog input").value 

  savedReplacements[newSaveName] = currentReplacement
  setSavedReplacements(savedReplacements)
  console.log(savedReplacements)

  document.getElementById("saveDialog").close()
  genSavedReplacements()
}

// Actual text interaction

const generateCurrentReplacement = () => {
  currentReplacement = []
  document.querySelectorAll(".mod").forEach(modEl => {
    currentReplacement.push({
      find: modEl.querySelector("#find").value,
      replace: modEl.querySelector("#replace").value,
      regex: modEl.querySelector("#regex").checked,
    })
  })
}

const replaceText = () => {
  let text = document.getElementById("input").value

  currentReplacement.forEach(mod => {
    if (mod.regex) {
      text = text.replace(new RegExp(mod.find, "g"), mod.replace)
    } else {
      text = text.split(mod.find).join(mod.replace)
    }
  })

  document.getElementById("output").value = text
}

// SAVED REPLACEMENTS

const getSavedReplacements = () => JSON.parse(localStorage.getItem(saveKey)) ?? {}
const setSavedReplacements = replacements => localStorage.setItem(saveKey, JSON.stringify(replacements))

const genSavedReplacements = () => {
  document.getElementById("saves").innerHTML = ""

  for (const [key, value] of Object.entries(getSavedReplacements())) {
    let newSaveSection = saveSection.cloneNode(true)
    newSaveSection.querySelector("span").innerText = key
    newSaveSection.dataset.key = key
    document.getElementById("saves").appendChild(newSaveSection)
  }
}

const getSavedKey = el => el.parentElement.parentElement.dataset.key

const loadReplacement = el => {
  currentReplacement = getSavedReplacements()[getSavedKey(el)]

  document.getElementById("modifiers").innerHTML = ""
  currentReplacement.forEach(e => {
    const newModSection = modSection.cloneNode(true)
    newModSection.querySelector("#find").value = e.find
    newModSection.querySelector("#replace").value = e.replace
    newModSection.querySelector("#regex").checked = e.regex
    document.getElementById("modifiers").appendChild(newModSection)
  })

  document.querySelector("#saveDialog input").value = getSavedKey(el)
  document.getElementById("liveUpdate").className = "on"
  replaceText()
}

const exportReplacement = el => {
  document.querySelector("#exportDialog textarea").value = JSON.stringify({
    name: getSavedKey(el),
    replacement: getSavedReplacements()[getSavedKey(el)]
  })
  openDialog("exportDialog")
}

const importReplacement = () => {
  const importedReplacement = JSON.parse(document.querySelector("#importDialog textarea").value)

  let savedReplacements = getSavedReplacements()
  savedReplacements[importedReplacement.name] = importedReplacement.replacement
  setSavedReplacements(savedReplacements)
  genSavedReplacements()

  closeDialog("importDialog")
}

const deleteReplacement = el => {
  let savedReplacements = getSavedReplacements()
  delete savedReplacements[getSavedKey(el)]
  setSavedReplacements(savedReplacements)
  genSavedReplacements()
}

const clearAllSaves = () => { 
  setSavedReplacements({}) 
  genSavedReplacements()
  closeDialog("clearDialog")
}

// Update page
genSavedReplacements()
replaceText()