using UnityEngine;

public class collision : MonoBehaviour
{
    public player movement;

    void OnCollisionEnter(UnityEngine.Collision collision)
    {
      if(collision.collider.tag =="obstacle")
        {
            movement.enabled = false;
            FindObjectOfType<gamemanager>().Endgame();
        }
    }
}
