using UnityEngine;

public class endgame : MonoBehaviour
{
    public gamemanager gameManager;
    void OnTriggerEnter()
    {
        gameManager.completelevel();
        
    }

}
